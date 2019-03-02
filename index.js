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

  const {board, you} = request.body
  const {body} = you
  const head = body[0]
  const {snakes, food} = board

  const snakesWithoutYou = snakes.filter(snake => {
    return snake.body[0].x !== head.x && snake.body[0].y !== head.y
  })

  const possibleChoicesWithoutSnakes = getViableChoices(head, body, {height: board.height, width: board.width})

  const possibleChoices = dontHitSnakes(possibleChoicesWithoutSnakes, snakesWithoutYou)
  const possibleChoiceNames = possibleChoices.map(i => i.name)

  const closestFood = foodCloseBy(head, food)
  console.log('CLOSEST FOOD', closestFood)

  if (closestFood) {
    // move towards food!
    let x = closestFood.x - head.x
    let y = head.y - closestFood.y // reversed y axis

    const data = {}

    if (Math.abs(x) > Math.abs(y)) {
      if (x > 0) {
        data.move = 'right'
      } else {
        data.move = 'left'
      }
    } else {
      if (y > 0) {
        data.move = 'up'
      } else {
        data.move = 'down'
      }
    }
    console.log('SNAKE FOOD!')

    if (!possibleChoiceNames.includes(data.move)) {
      const move = randomValidMove(possibleChoiceNames)
      const data = { move }
      return response.json(data)

    } else {
      return response.json(data)
    }

  } else {
    const move = randomValidMove(possibleChoiceNames)
    const data = { move }
    return response.json(data)
  }
  
  // // am I the biggest?
  // const biggest = isBiggest(body, snakesWithoutYou)

  // if (biggest) {
  // // if biggest, go for snake heads!

  // } else {
  // // if not biggest, eat!

  // }

  // random!

   // Response data
})

function randomValidMove(choices) {
  return choices[Math.floor(Math.random()*choices.length)];
}

function foodCloseBy(head, food) {
  const sortedFood = food.sort((a, b) => {
    return (Math.abs((b.x - head.x)) + Math.abs(b.y - head.y)) - (Math.abs(a.x - head.x) + Math.abs(a.y - head.y))
  })

  if (sortedFood.length > 0) {
    if ((Math.abs(sortedFood[0].x - head.x) + Math.abs(sortedFood[0].x - head.x)) < 6) {
      return sortedFood[0]
    } else {
      return undefined
    }
  } else {
    return false
  }
}

// doesn't account for head-on-head collisions
function dontHitSnakes(options, snakes) {
  return options.filter(option => {
    return snakes.reduce((acc, snake) => {
      const mappedBody = snake.body.map(i => `${i.x}_${i.y}`)
      return acc && !mappedBody.includes(`${option.x}_${option.y}`)
    }, true)
  })
} 

function isBiggest(body, snakes) {
  return snakes.reduce((acc, curr) => {
    console.log('lenght', body.length, curr.body.length, body.length > curr.body.length)
    return acc && (body.length > curr.body.length)
  }, true)
}

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

  const mappedBody = body.map(i => `${i.x}_${i.y}`)

  const viableWithoutBody = options.filter(i => !mappedBody.includes(`${i.x}_${i.y}`))

  const viableWithoutWalls = viableWithoutBody.filter(i => {
    return !(i.x === -1 || i.x === board.width - 1 || i.y === -1 || i.y === board.height - 1)
  })

  // console.log(viableWithoutWalls, 'heyo!')

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
