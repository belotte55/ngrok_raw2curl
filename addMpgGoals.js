let currentToken

const getPlayers = () => {
  const rows = document.querySelectorAll('body > div > div > div > div > div > div > div > div > div > div')
  const players = []
  rows.forEach(row => {
    const children = row.querySelectorAll('button > div:nth-child(2) > p')
    if (children.length > 0) {
      players.push(...children)
    }
  })
  return players
}

const divisionMatchId = window.location.href.match(/(mpg_division_match_.*)$/)[0]
const divisionMatchUrl = `https://api.mpg.football/division-match/${divisionMatchId}`

const getDivisionMatch = (token) => new Promise((resolve, reject) => {
  return fetch(divisionMatchUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `${token}`
    }
  }).then(response => response.json()).then(resolve)
})

const addMpgGoals = (divisionMatch) => {
  // PREPARE Line avg
  const teamLineAverage = {
    home: {
      goalkeeper: {
        players: [],
      },
      defenders: {
        players: [],
      },
      midfielders: {
        players: [],
      },
      forwards: {
        players: [],
      },
    },
    away: {
      goalkeeper: {
        players: [],
      },
      defenders: {
        players: [],
      },
      midfielders: {
        players: [],
      },
      forwards: {
        players: [],
      },
    },
  };

  const otherSides = {
    home: 'away',
    away: 'home',
  };

  ['home', 'away'].forEach((side) => {
    const maxIndexGoalKeeper = 1;
    const maxIndexDefender = +divisionMatch[side].composition[0] + maxIndexGoalKeeper;
    const maxIndexMidfielder = +divisionMatch[side].composition[1] + maxIndexDefender;
    const maxIndexForward = +divisionMatch[side].composition[2] + maxIndexMidfielder;

    const playerGoalKeeperId = divisionMatch[side].playersOnPitch[1].playerId;
    teamLineAverage[side].goalkeeper.players.push((divisionMatch[side].players[playerGoalKeeperId].rating || 0) + divisionMatch[side].players[playerGoalKeeperId].bonusRating);

    for (let indexDefender = maxIndexGoalKeeper + 1; indexDefender <= maxIndexDefender; indexDefender += 1) {
      const { playerId } = divisionMatch[side].playersOnPitch[indexDefender];
      teamLineAverage[side].defenders.players.push((divisionMatch[side].players[playerId].rating || 0) + divisionMatch[side].players[playerId].bonusRating);
    }

    for (let indexMidfielder = maxIndexDefender + 1; indexMidfielder <= maxIndexMidfielder; indexMidfielder += 1) {
      const { playerId } = divisionMatch[side].playersOnPitch[indexMidfielder];
      teamLineAverage[side].midfielders.players.push((divisionMatch[side].players[playerId].rating || 0) + divisionMatch[side].players[playerId].bonusRating);
    }

    for (let indexForward = maxIndexMidfielder + 1; indexForward <= maxIndexForward; indexForward += 1) {
      const { playerId } = divisionMatch[side].playersOnPitch[indexForward];
      teamLineAverage[side].forwards.players.push((divisionMatch[side].players[playerId].rating || 0) + divisionMatch[side].players[playerId].bonusRating);
    }

    Object.keys(teamLineAverage[side]).forEach((line) => {
      teamLineAverage[side][line].average = teamLineAverage[side][line].players.reduce((a, b) => a + b, 0) / teamLineAverage[side][line].players.length;
    });
  });

  // ADD MPG GOALS
  ['home', 'away'].forEach((side) => {
    const maxIndexGoalKeeper = 1;
    const maxIndexDefender = +divisionMatch[side].composition[0] + maxIndexGoalKeeper;
    const maxIndexMidfielder = +divisionMatch[side].composition[1] + maxIndexDefender;
    const maxIndexForward = +divisionMatch[side].composition[2] + maxIndexMidfielder;

    for (let indexDefender = maxIndexGoalKeeper + 1; indexDefender <= maxIndexDefender; indexDefender += 1) {
      const { playerId } = divisionMatch[side].playersOnPitch[indexDefender];
      if (!divisionMatch[side].players[playerId].mpgGoals) {
        divisionMatch[side].players[playerId].mpgGoals = 0
      }
      if (divisionMatch[side].players[playerId].goals === 0) {
        const ratingWithBonus = (divisionMatch[side].players[playerId].rating || 0) + divisionMatch[side].players[playerId].bonusRating;
        if (side === 'home') {
          if (ratingWithBonus >= 5
            && (ratingWithBonus >= teamLineAverage[otherSides[side]].forwards.average)
            && ((ratingWithBonus - 1) >= teamLineAverage[otherSides[side]].midfielders.average)
            && ((ratingWithBonus - 1.5) >= teamLineAverage[otherSides[side]].defenders.average)
            && ((ratingWithBonus - 2) >= teamLineAverage[otherSides[side]].goalkeeper.average)
          ) {
            divisionMatch[side].players[playerId].mpgGoals = 1;
          }
        } else if (ratingWithBonus >= 5
          && (ratingWithBonus > teamLineAverage[otherSides[side]].forwards.average)
          && ((ratingWithBonus - 1) > teamLineAverage[otherSides[side]].midfielders.average)
          && ((ratingWithBonus - 1.5) > teamLineAverage[otherSides[side]].defenders.average)
          && ((ratingWithBonus - 2) > teamLineAverage[otherSides[side]].goalkeeper.average)) {
          divisionMatch[side].players[playerId].mpgGoals = 1;
        }
      }
    }

    for (let indexMidfielder = maxIndexDefender + 1; indexMidfielder <= maxIndexMidfielder; indexMidfielder += 1) {
      const { playerId } = divisionMatch[side].playersOnPitch[indexMidfielder];
      if (!divisionMatch[side].players[playerId].mpgGoals) {
        divisionMatch[side].players[playerId].mpgGoals = 0
      }
      if (divisionMatch[side].players[playerId].goals === 0) {
        const ratingWithBonus = (divisionMatch[side].players[playerId].rating || 0) + divisionMatch[side].players[playerId].bonusRating;
        if (side === 'home') {
          if (ratingWithBonus >= 5
            && ((ratingWithBonus) >= teamLineAverage[otherSides[side]].midfielders.average)
            && ((ratingWithBonus - 1) >= teamLineAverage[otherSides[side]].defenders.average)
            && ((ratingWithBonus - 1.5) >= teamLineAverage[otherSides[side]].goalkeeper.average)
          ) {
            divisionMatch[side].players[playerId].mpgGoals = 1;
          }
        } else if (ratingWithBonus >= 5
          && ((ratingWithBonus) > teamLineAverage[otherSides[side]].midfielders.average)
          && ((ratingWithBonus - 1) > teamLineAverage[otherSides[side]].defenders.average)
          && ((ratingWithBonus - 1.5) > teamLineAverage[otherSides[side]].goalkeeper.average)) {
          divisionMatch[side].players[playerId].mpgGoals = 1;
        }
      }
    }

    for (let indexForward = maxIndexMidfielder + 1; indexForward <= maxIndexForward; indexForward += 1) {
      const { playerId } = divisionMatch[side].playersOnPitch[indexForward];
      if (!divisionMatch[side].players[playerId].mpgGoals) {
        divisionMatch[side].players[playerId].mpgGoals = 0
      }
      if (divisionMatch[side].players[playerId].goals === 0) {
        const ratingWithBonus = (divisionMatch[side].players[playerId].rating || 0) + divisionMatch[side].players[playerId].bonusRating;
        if (side === 'home') {
          if (ratingWithBonus >= 5
            && ((ratingWithBonus) >= teamLineAverage[otherSides[side]].defenders.average)
            && ((ratingWithBonus - 1) >= teamLineAverage[otherSides[side]].goalkeeper.average)
          ) {
            divisionMatch[side].players[playerId].mpgGoals = 1;
          }
        } else if (ratingWithBonus >= 5
          && ((ratingWithBonus) > teamLineAverage[otherSides[side]].defenders.average)
          && ((ratingWithBonus - 1) > teamLineAverage[otherSides[side]].goalkeeper.average)) {
          divisionMatch[side].players[playerId].mpgGoals = 1;
        }
      }
    }
  });
}

function displayMpgGoals(divisionMatch) {
  const players = getPlayers()
  const playersByName = {}
  players.forEach(player => {
    player.innerHTML = player.innerHTML.replace(/ ⚽️*/g, '')
    playersByName[player.innerHTML] = player
  });
  ['home', 'away'].forEach(side => {
    Object.values(divisionMatch[side].players).forEach(player => {
      if (playersByName[player.lastName] && divisionMatch[side].players[player.playerId].mpgGoals) {
        console.log(divisionMatch[side].players[player.playerId])
        playersByName[player.lastName].innerHTML = `${playersByName[player.lastName].innerHTML} ${Array(divisionMatch[side].players[player.playerId].mpgGoals).fill('⚽️').join('')}`
        playersByName[player.lastName].style.cssText = `font-weight: bolder; color: yellow;`
      }
    })
  })
}

function getToken(that = this) {
  console.log(that)
  // console.log(that.document)
  const keys = Object.keys(that.document)
  const key = keys.find(k => k.includes('__reactContainer$'))
  if (key) {
    console.log({key})
    console.log(that.document[key])
    const subKey = key.split('$')[1]
    console.log(that.document[key].stateNode.current.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.child.stateNode[`__reactFiber$${subKey}`].return.return.return.return.return.return.return.return.return.return.return.return.return.return.memoizedState.next.next.next.memoizedState)
  }

  let token = null
  let cache = []
  const searchToken = (object, path = '', i = 1) => {
    if (i === 1) {
      if (typeof object === 'object') {
        console.log('is object')
        console.log(Object.keys(object).length)
      } else {
        console.log('is not object')
        console.log(object)
      }
    }
    if (token) {
      return
    }
    if (Array.isArray(object)) {
      const rawToken = object.find(e => `${e}`.indexOf('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9') === 0)
      if (rawToken) {
        console.log(path)
        token = rawToken
        return
      }
    }
    if (typeof object === 'object' && object) {
      if (cache.includes(object)) {
        return
      }
      cache.push(object)
      Object.keys(object).forEach(key => {
        return searchToken(object[key], path ? `${path}.${key}` : key, 0)
      })
    }
  }
  searchToken(that)
  if (Array.isArray(token)) {
    return token[0]
  }
  return token
}

async function processGoals (token) {
  console.log({
    fromProcessGoals: document
  })
  // const token = currentToken || getToken(document)
  console.log({token})

  if (!token) {
    return console.error('no token found')
  }

  const divisionMatch = await getDivisionMatch(token)

  addMpgGoals(divisionMatch)
  displayMpgGoals(divisionMatch)
}

function addButton() {
  console.log({
    fromAddButton: document
  })
  console.log('will add button')
  const a = document.createElement('a')
  const li = document.createElement('li');
  const text = document.createTextNode('GOALS')
  a.appendChild(text)
  a.href = '#'
  a.style.cssText = 'all: unset; font-weight: bold;'
  li.appendChild(a)
  li.style.cssText = 'color: red;list-style: none;';
  document.querySelector('body > div > div > div > div > a').classList.forEach(className => {
    li.classList.add(className)
  })
  document.querySelector('body > div > div > div > div').appendChild(li);
  li.addEventListener('click', async () => processGoals())
}

window.onload = async () => {
  console.log('onload')
  // return processGoals()
};

setTimeout(function (){
  const token = getToken(this)
  addButton()
  processGoals(token)
}, 5000)

// window.addEventListener("DOMContentLoaded", (event) => {
//   console.log('DOMContentLoaded')
//   const token = getToken(this)
//   addButton()
//   processGoals(token)
// });

console.log('The extension works');
// ... logic that does not need DOM

function run() {
  console.log('The DOM is loaded');
  // ... logic that needs DOM
}

document.addEventListener("DOMContentLoaded", run);

// setTimeout(function () {
//   let token = null
//   let cache = []
//   const searchToken = (object, path = '', i = 1) => {
//     if (i === 1) {
//       if (typeof object === 'object') {
//         console.log('is object')
//         console.log(Object.keys(object).length)
//       } else {
//         console.log('is not object')
//         console.log(object)
//       }
//     }
//     if (token) {
//       return
//     }
//     if (Array.isArray(object)) {
//       const rawToken = object.find(e => `${e}`.indexOf('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9') === 0)
//       if (rawToken) {
//         console.log(path)
//         token = rawToken
//         return
//       }
//     }
//     if (typeof object === 'object' && object) {
//       if (cache.includes(object)) {
//         return
//       }
//       cache.push(object)
//       Object.keys(object).forEach(key => {
//         return searchToken(object[key], `${path}.${key}`, 0)
//       })
//     }
//   }
//   searchToken(this)
//   if (Array.isArray(token)) {
//     return token[0]
//   }
//   addButton()
//   processGoals(token)
// }, 3000)