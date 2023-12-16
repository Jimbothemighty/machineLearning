import json
import numpy as np
import tensorflow as tf

class DQNAgent:
    def __init__(self, actions, state_size, learning_rate=0.01, discount_factor=0.95):
        self.actions = actions  # List of possible actions
        self.state_size = state_size
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        self.model = self.create_model()

        # Epsilon-greedy strategy parameters
        self.epsilon = 0.95
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995

        # Training data tracking
        self.times_trained = 0
        self.batch_size = 10
        self.this_batch = []
        self.av_steps_per_training_batch = []

    def create_model(self):
        model = tf.keras.Sequential()
        model.add(tf.keras.layers.Dense(24, input_shape=(self.state_size,), activation='relu'))
        model.add(tf.keras.layers.Dense(24, activation='relu'))
        model.add(tf.keras.layers.Dense(len(self.actions), activation='linear'))
        model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=self.learning_rate),
                      loss='mean_squared_error')
        return model

    def update_aggregate_data(self, num_steps):
        self.times_trained += 1
        self.this_batch.append(num_steps)

        if self.times_trained % self.batch_size == 0:
            avg = np.mean(self.this_batch) if self.this_batch else 0
            self.this_batch = []
            self.av_steps_per_training_batch.append(avg)

    def get_aggregates(self):
        return self.av_steps_per_training_batch

    def train(self, state, action_index, reward, next_state, done):
        state_tensor = tf.convert_to_tensor([state], dtype=tf.float32)
        next_state_tensor = tf.convert_to_tensor([next_state], dtype=tf.float32)

        with tf.GradientTape() as tape:
            current_q = self.model(state_tensor, training=True)
            next_q = self.model(next_state_tensor, training=True)
            updated_q = current_q.numpy()
            max_next_q = np.max(next_q.numpy(), axis=1)

            updated_q[0, action_index] = reward if done else reward + self.discount_factor * max_next_q

            # Compute loss
            loss = tf.keras.losses.mean_squared_error(current_q, updated_q)

        # Perform gradient update
        grads = tape.gradient(loss, self.model.trainable_variables)
        self.model.optimizer.apply_gradients(zip(grads, self.model.trainable_variables))

    def choose_action(self, state):
        if np.random.rand() < self.epsilon:
            return np.random.choice(self.actions)
        else:
            state_tensor = tf.convert_to_tensor([state], dtype=tf.float32)
            q_values = self.model.predict(state_tensor)
            return np.argmax(q_values[0])

    def update_epsilon(self):
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

class GridEnvironment:
    def __init__(self, size, obstacles):
        self.grid_size = size
        self.obstacles = obstacles
        self.grid = [[0 for _ in range(size)] for _ in range(size)]
        self.agent_position = {'x': 0, 'y': 0}
        self.reset()

    def reset(self):
        self.agent_position = {'x': 0, 'y': 0}  # Start at the top-left corner
        # Add more initialization logic if needed
        return [self.agent_position['x'], self.agent_position['y']]

    def step(self, action):
        # Update the agent's position based on the action
        if action == 0 and self.agent_position['y'] > 0:  # Move up
            self.agent_position['y'] -= 1
        elif action == 1 and self.agent_position['y'] < self.grid_size - 1:  # Move down
            self.agent_position['y'] += 1
        elif action == 2 and self.agent_position['x'] > 0:  # Move left
            self.agent_position['x'] -= 1
        elif action == 3 and self.agent_position['x'] < self.grid_size - 1:  # Move right
            self.agent_position['x'] += 1

        reward = 0
        done = False

        if self.agent_position['x'] == self.grid_size - 1 and self.agent_position['y'] == self.grid_size - 1:
            reward = 1
            done = True
        elif any(obstacle['row'] == self.agent_position['x'] and obstacle['col'] == self.agent_position['y'] for obstacle in self.obstacles):
            reward = self.get_obstacle_cost()
        else:
            reward = self.get_distance_living_cost()

        return {'state': self.get_state(), 'reward': reward, 'done': done}

    def get_obstacle_cost(self):
        return self.get_distance_living_cost() * 2

    def get_distance_living_cost(self):
        max_distance = self.grid_size - 1
        return -((max_distance * 2) - self.agent_position['x'] - self.agent_position['y']) / 100

    def get_state(self):
        return [self.agent_position['x'], self.agent_position['y']]

def train_agent(agent, grid_size, obstacles, episodes):
    env = GridEnvironment(grid_size, obstacles)
    steps_taken = None

    for episode in range(episodes):
        state = env.reset()
        done = False
        total_reward = 0
        max_iteration = 100000000
        iteration = 0

        steps_taken = {
            'path': [],
            'complete': False,
        }

        while not done and iteration < max_iteration:
            action = agent.choose_action(state)
            original_state = state
            result = env.step(action)
            next_state = result['state']
            reward = result['reward']
            is_done = result['done']

            is_valid_move = 0 <= state[0] < grid_size and 0 <= state[1] < grid_size

            if not is_valid_move:
                continue

            agent.train(original_state, action, reward, next_state, is_done)

            agent.update_epsilon()

            state = next_state
            done = is_done
            total_reward += reward

            steps_taken['path'].append({
                'row': next_state[0],
                'col': next_state[1],
            })

            if done:
                steps_taken['complete'] = True
                agent.update_aggregate_data(len(steps_taken['path']))

            iteration += 1

        print(f"Episode {episode}, Total Reward: {total_reward}")

    return steps_taken

agent = DQNAgent([0, 1, 2, 3], 2)
grid_size = 5
obstacles = []
num_trainings = 10

print(tf.__version__)

# path_data = train_agent(agent, grid_size, obstacles, num_trainings)

# print(json.dumps(path_data))