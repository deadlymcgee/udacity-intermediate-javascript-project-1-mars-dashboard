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
        <div class="rover-menu-item">
            <h4 onclick="getRoverDetails('${rover}')">${rover}</h4>
        </div>
    `
}

const RoverMenu = (Component, rovers) => {
    return `
        <nav id="rover-menu">
            ${rovers.map(rover => Component(rover)).join('')}
        </nav>
    `
}

const RoverPhoto = (photo) => {
    return `
        <img class="rover-photo" src="${photo.img_src}"/>
    `
}

const RoverDetails = (Component, currentRover) => {

    return (
        currentRover ?
            `
                <h1>Rover ${currentRover.name} details</h1>
                <div>
                   Launch Date: ${currentRover.launchDate}
                </div>
                   Landing Date: ${currentRover.landingDate}
                <div>
                   Status: ${currentRover.status}
                </div>
                <div>
                   Most Recent Photos Date: ${currentRover.recentDate} 
                </div>
                <div id="rover-photos">
                    ${currentRover.photos.map(photo => Component(photo)).join('')}
                </div>
            ` :
            'Please select a rover'
    )
}

const RoverDashboard = (isLoaded, rovers, currentRover) => {
    if (!isLoaded) {
        return 'Loading rover data ...'
    }
    return `
        ${RoverMenu(Rover, rovers)}
        <section>${RoverDetails(RoverPhoto, currentRover)}</section>
    `
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
}
