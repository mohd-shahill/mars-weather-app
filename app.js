const API_KEY = 'inmaKcaQdFX9uaRLiN84ZdBl80BfamggwquyWZi2'

// injected API key by ${}
const API_URL = `https://api.nasa.gov/insight_weather/?api_key=${API_KEY}&feedtype=json&ver=1.0`

// these are the elements fetched from index.html
const previousWeatherToggle = document.querySelector('.show-previous-weather');
const previousWeather = document.querySelector('.previous-weather');

// this is for the first section 
const currentSolElement = document.querySelector('[data-current-sol]')
const currentDateElement = document.querySelector('[data-current-date]')
const currentTempHighElement = document.querySelector('[data-current-temp-high]')
const currentTempLowElement = document.querySelector('[data-current-temp-low]')
const windSpeedElement = document.querySelector('[data-wind-speed]')
const windDirectionText = document.querySelector('[data-wind-direction-text]')
const windDirectionArrow = document.querySelector('[data-wind-direction-arrow]')


// this is for the previous sols section 
const previousSolTemplate = document.querySelector(`[data-previous-sols-template]`)
const previousSolContainer = document.querySelector(`[data-previous-sols]`)

// this is for to toggle the button
const unitToggle = document.querySelector(`[data-unit-toggle]`)
const metricRadio = document.getElementById('cel')
const imperialRadio = document.getElementById('fah')



previousWeatherToggle.addEventListener('click', () => {
    previousWeather.classList.toggle('show-weather')
})

let selectedSolIndex

getWeather().then(sols => {
    selectedSolIndex = sols.length - 1
    displaySelectedSol(sols)
    displayPreviousSols(sols)
    updateUnits()

    unitToggle.addEventListener('click', () => {
        let metricUnits = !isMetric()
        metricRadio.checked = metricUnits
        imperialRadio.checked = !metricUnits
        displaySelectedSol(sols)
        displayPreviousSols(sols)
        updateUnits()
    })
})

metricRadio.addEventListener('change', () => {
    displaySelectedSol(sols)
    displayPreviousSols(sols)
    updateUnits()
})
imperialRadio.addEventListener('change', () => {
    displaySelectedSol(sols)
    displayPreviousSols(sols)
    updateUnits()
})

function displaySelectedSol(sols){
    const selectedSol = sols[selectedSolIndex]
    currentSolElement.innerText = selectedSol.sol
    currentDateElement.innerText = displayDate(selectedSol.date)
    currentTempHighElement.innerText = displayTemp(selectedSol.maxTemp)
    currentTempLowElement.innerText = displayTemp(selectedSol.minTemp)
    windSpeedElement.innerText = displaySpeed(selectedSol.windSpeed)
    windDirectionArrow.style.setProperty('--direction', `${selectedSol.windDirectionDegrees}deg`)
    windDirectionText.innerText = selectedSol.windDirectionCardinal
}

function displayPreviousSols(sols){
    previousSolContainer.innerHTML =''
    sols.forEach((solData, index) => {
        const solContainer = previousSolTemplate.content.cloneNode(true)
        solContainer.querySelector(`[data-sol]`).innerText = solData.sol
        solContainer.querySelector(`[data-date]`).innerText = displayDate(solData.date)
        solContainer.querySelector(`[data-temp-high]`).innerText = displayTemp(solData.maxTemp)
        solContainer.querySelector(`[data-temp-low]`).innerText = displayTemp(solData.minTemp)
        solContainer.querySelector(`[data-select-button]`).addEventListener('click', () => {
            selectedSolIndex = index
            displaySelectedSol(sols)
        })
        previousSolContainer.appendChild(solContainer)
    })
}

function displayDate(date){
    return new Date(date).toUTCString().split(' ').slice(0, 4).join(' ');
}

function displayTemp(temp){
    let returnTemp = temp
    if (!isMetric()){
        returnTemp = (temp - 32) * (5/9)
    }
    return Math.round(returnTemp)
}

function displaySpeed(speed){
    let returnSpeed = speed
    if(!isMetric()){
        returnSpeed = speed /1.609
    }
    return Math.round(returnSpeed)
}

function getWeather() {
    return fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            const{
                sol_keys,
                validity_checks,
                ...solData
            } =data
           return Object.entries(solData).map(([sol, data]) => {
                return {
                    sol: sol,
                    maxTemp: data.AT.mx,
                    minTemp: data.AT.mn,
                    windSpeed: data.HWS.av,
                    windDirectionDegrees: data.WD.most_common.compass_degrees,
                    windDirectionCardinal: data.WD.most_common.compass_point,
                    date: new Date(data.First_UTC).toUTCString()
                }
            })
        })
}

function updateUnits(){
    const speedUnits = document.querySelectorAll(`[data-speed-unit]`)
    const tempUnits = document.querySelectorAll(`[data-temp-unit]`)
    speedUnits.forEach(unit => {
        unit.innerText = isMetric() ? 'kph' : 'mph'
    })
    tempUnits.forEach(unit => {
        unit.innerText = isMetric() ? 'C' : 'F'
    })
}

function isMetric(){
    return metricRadio.checked
}