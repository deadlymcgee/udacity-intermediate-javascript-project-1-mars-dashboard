let store = Immutable.Map({
    user: Immutable.Map({ name: "Student" }),
    apod: '',
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    roverData: Immutable.List([]),
    isLoaded: false,
})

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (state, newState) => {
    store = store.merge(newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}

const getRoverDetails = (name) => {
    console.log(`getting rover ${name} details!`)
    const roverDetails = store.toJS().roverData.find(rover => rover.name === name)
    updateStore({}, {currentRover: roverDetails, isRoverDetails: true})
}


// create content
const App = (state) => {
    let { rovers, apod, user, isLoaded, currentRover } = state.toJS()

    if (!isLoaded) {
        getRovers(store)
    }

    return `
        <header></header>
        <main>
            ${Greeting(user.name)}
            ${RoverDashboard(isLoaded, rovers, currentRover)}
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS
const Rover = (rover) => {
    return `
        <h1 onclick="getRoverDetails('${rover}')">${rover}</h1>
    `
}

const RoverMenu = (rovers) => {
    return `${rovers.map(rover => Rover(rover)).join('')}`
}

const RoverDetails = (currentRover) => {

    return (currentRover ? `<h1>Rover ${currentRover.name} details</h1>` : 'Please select a rover')
}

const RoverDashboard = (isLoaded, rovers, currentRover) => {
    if (!isLoaded) {
        return 'Loading rover data ...'
    }
    return `
        <section>${RoverMenu(rovers)}</section>
        <section>${RoverDetails(currentRover)}</section>
    `
}

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay()
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

// ------------------------------------------------------  API CALLS
const getRovers = async (state) => {
    const { rovers } = state.toJS()
    const promises = rovers.map(rover => {
        return fetch(`http://localhost:3000/rover`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({rover: rover})
        })
            .then(res => res.json())
            .then(rover => rover)
    })
    const roverData = await Promise.all(promises)
    updateStore(store, {isLoaded: true, roverData: roverData})

    return data
}

// Example API call
const getImageOfTheDay = () => {

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))

    return data
}
