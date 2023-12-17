import express from 'express'
import request from 'request'

export const app = express()

if (!process.env.VITE) {
	const frontendFiles = process.cwd() + `/dist`
	app.use(express.static(frontendFiles))
	app.get(`/*`, (_, res) => {
		res.send(frontendFiles + `/index.html`)
	})
	app.listen(process.env.PORT)
}

app.get(`/api/tensorflow_simple`, function(req, res) {
	request(`http://127.0.0.1:5000/tensorflow_simple`, function(error, response, body) {
		console.error(`error:`, error) // Print the error
		console.log(`statusCode:`, response && response.statusCode) // Print the response status code if a response was received
		console.log(`body:`, body) // Print the data received
		res.send(body) // Display the response on the website
	})
})

app.get(`/api/tensorflow_simple_obstacles`, function(req, res) {
	request(`http://127.0.0.1:5000/tensorflow_simple_obstacles`, function(error, response, body) {
		console.error(`error:`, error) // Print the error
		console.log(`statusCode:`, response && response.statusCode) // Print the response status code if a response was received
		console.log(`body:`, body) // Print the data received
		res.send(body) // Display the response on the website
	})
})

app.get(`/api/tensorflow_medium_obstacles`, function(req, res) {
	request(`http://127.0.0.1:5000/tensorflow_medium_obstacles`, function(error, response, body) {
		console.error(`error:`, error) // Print the error
		console.log(`statusCode:`, response && response.statusCode) // Print the response status code if a response was received
		console.log(`body:`, body) // Print the data received
		res.send(body) // Display the response on the website
	})
})

app.get(`/api/hello`, (_, res) =>
	res.json({ greeting: `Hello from Express server!` }
	)
)
