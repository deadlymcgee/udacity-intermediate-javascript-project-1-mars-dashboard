require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls
app.post('/rover', async (req, res) => {
    try {
        // get the manifest
        const { photo_manifest } = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.body.rover}?api_key=${process.env.API_KEY}`)
            .then(res => res.json())

        // retrieve the desired information
        const rover = getRoverDetails(photo_manifest)

        // get the photos
        const { photos } = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.body.rover}/photos?sol=${photo_manifest.max_sol}&api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send(Object.assign({}, rover, {photos: photos}))

    } catch (err) {
        console.log('error:', err);
    }
})

const getRoverDetails = (manifest) => {
    const { name, status, max_date, launch_date, landing_date  } = manifest
    return {
        name: name,
        status: status,
        recentDate: max_date,
        launchDate: launch_date,
        landingDate: landing_date
    }
}

app.listen(port, () => console.log(`Mars Dashboard app listening on port ${port}!`))