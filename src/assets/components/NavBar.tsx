export function NavBar() {
	return <div className="NavBar">
		<div className='logInButtonContainer'>edUi Machine Learning<button onClick={() => {
			window.location.assign(`https://edmundbrown.com`)
		}}>
			{`https://edmundbrown.com`}
		</button>
		</div>
	</div>
}
