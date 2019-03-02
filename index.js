const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()
const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js')

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

// Handle POST request to '/start'
app.post('/start', (request, response) => {
  // NOTE: Do something here to start the game

  // Response data
  const data = {
    color: '#f48342',
    headType: "silly",
    tailType: "round-bum"
  }

  return response.json(data)
})

// Handle POST request to '/move'
app.post('/move', (request, response) => {
  // NOTE: Do something here to generate your move

  const body = request.body.you.body
  const head = body[0]
  const board = request.body.board

  const possibleChoices = getViableChoices(head, body, {height: board.height, width: board.width})

  
  var move = possibleChoices[Math.floor(Math.random()*possibleChoices.length)];

   // Response data
  const data = {
    move: move.name
  }

  return response.json(data)
})

function getViableChoices(head, body, board) {

  const options = [
    {name: 'left', x: head.x - 1, y: head.y},
    {name: 'right', x: head.x + 1, y: head.y},
    {name: 'up', x: head.x, y: head.y - 1},
    {name: 'down', x: head.x, y: head.y + 1},
    // {x: head.x + 1, y: head.y + 1},
    // {x: head.x + 1, y: head.y - 1},
    // {x: head.x - 1, y: head.y + 1},
    // {x: head.x - 1, y: head.y - 1},
  ]

  console.log('heyo!')

  const mappedBody = body.map(i => `${i.x}_${i.y}`)

  const viableWithoutBody = options.filter(i => !mappedBody.includes(`${i.x}_${i.y}`))

  const viableWithoutWalls = viableWithoutBody.filter(i => {
    return !(i.x === -1 || i.x === board.width - 1 || i.y === -1 || i.y === board.height - 1)
  })

  console.log(viableWithoutWalls, 'heyo!')

  return viableWithoutWalls
}

app.post('/end', (request, response) => {
  // NOTE: Any cleanup when a game is complete.
  return response.json({})
})

app.post('/ping', (request, response) => {
  // Used for checking if this snake is still alive.
  return response.json({});
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})
