const firstQuote = 'Eh pourquoi tu clic ??'
const finalQuote = 'Ok t\'as gagné'
const quotesA = [
  'Stop !',
  'Arrête ca !',
  'Pcchhhht !!',
].sort(() => Math.random() - .5)
const quotesB = [
  'Bon ca suffit maintenant !',
].sort(() => Math.random() - .5)
let clicked = 0

const toastConfig = {
  text: 'Copied!',
  duration: 1000,
  close: true,
  gravity: 'top',
  position: 'right',
  offset: {
    y: 51
  },
  style: {
    background: 'linear-gradient(to right, #00b09b, #96c93d)',
  },
  onClick: () => {
    let quote
    switch (clicked) {
      case 0:
        quote = firstQuote
        break;
      default:
        ;;
    }
    if (clicked === 0) {
      quote = firstQuote
    } else if (clicked <= quotesA.length) {
      quote = quotesA[clicked - 1]
    } else if (clicked <= (quotesA.length + quotesB.length)) {
      quote = quotesB[clicked - quotesA.length - 1]
    } else if (clicked === (quotesA.length + quotesB.length + 1) ) {
      quote = finalQuote
    } else {
      return
    }
    Toastify({...toastConfig, ...{text: quote}}).showToast()
    clicked += 1
  }
}