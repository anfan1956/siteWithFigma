const colors = new Set()
data = data.replaceAll('&#39;', '"')
data = JSON.parse(data)
images = data.images
items = data.items
sizes = data.sizes.split(',')
styleid = String(data.styleid)

$(document).ready(function () {
  defineColors()
  renderColors()
  renderSizes()
  renderQuantities()
  activeColor()

  $('.image-icons').each(function () {
    $(this).click(function () {
      let iconSrc = $(this).attr('src')
      let image = iconSrc.split('/')[iconSrc.split('/').length - 1]
      images.forEach(function (item) {
        if (item.img == image) {
          activateColor(item.color)
        }
      })
      $('#mainImage').fadeOut(100, function () {
        $(this).attr('src', iconSrc).fadeIn(200)
      })
    })
  })

  /**
   * Add click handlers to available size options to handle selection
   * Highlights selected size option and calls selectColorSize
   * to set selected color and size
   * Also adds click handler to call addToBasket on cta click
   */
  $('.available').each(function () {
    $(this).on('click', function () {
      $('.available').removeClass('active')
      let sizeIndex = $(this).closest('.quantities').children().index($(this))
      let colorIndex = $(this)
        .closest('.quantities')
        .parent()
        .children()
        .index($(this).closest('.quantities'))
      $(this).addClass('active')
      selectColorSize(sizeIndex, colorIndex)
    })
  })
  $('.cta').on('click', addToBasket)
})

function selectColorSize (sizeIndex, colorIndex) {
  let color,
    size = ''
  $('.color').removeClass('active')
  $('.color').each(function () {
    if (colorIndex == $(this).index()) {
      color = $(this).text()
      $(this).addClass('active')
      activateColor(color)
    }
  })

  $('.size').removeClass('active')
  $('.size').each(function () {
    if (sizeIndex == $(this).index()) {
      size = $(this).text()
      $(this).addClass('active')
    }
  })
  let holder = 'Вы выбрали: ' + color + ', размер: ' + size
  $('#size-selection').attr('value', holder).css('font-size', '1.1rem')
}

function currentImage () {
  return $('#mainImage').attr('src').split('/').slice(-1)[0]
}

function activeColor () {
  images.forEach(function (image) {
    if (image.img == currentImage()) {
      let currentColor = image.color
      $('.color').each(function () {
        if ($(this).text() == currentColor) {
          $(this).addClass('active')
        }
      })
    }
  })
}

function defineColors () {
  for (let i = 0; i < images.length; i++) {
    colors.add(images[i].color)
  }
  return colors
}

function renderColors () {
  let colors = defineColors()
  colors = Array.from(colors)
  colors.unshift('Цвет')
  colors.forEach(function (color) {
    var newDiv = $('<div>')
    newDiv.addClass('color')
    newDiv.text(color)
    let id = color.replaceAll(' ', '')
    newDiv.attr('id', id)
    newDiv.click(function () {
      activateColor(color)
    })
    $('.colors').append(newDiv)
  })
}

function renderSizes () {
  sizes.forEach(function (size) {
    var newDiv = $('<div>')
    newDiv.addClass('size').text(size)
    $('.sizes').append(newDiv)
  })
}

function activateColor (color) {
  if (color == 'Цвет') {
    return
  } else {
    let newSrc = ''
    images.forEach(function (image) {
      if (image.color == color) {
        if (newSrc == '') {
          newSrc = '/imagesDir/' + styleid + '/800/' + image.img
        }
      }
    })
    $('#mainImage').fadeOut(100, function () {
      $(this).attr('src', newSrc).fadeIn(200)
    })
    $('.color').removeClass('active')
    let id = '#' + color.replaceAll(' ', '')
    $(id).addClass('active')
    $('#size-selection').attr('value', '')
    $('.size').removeClass('active')
  }
}

/**
 * Renders the available quantities by color and size.
 * Loops through the defined colors and adds a .quantities div for each.
 * Loops through the sizes and adds a .qty div with '-' text for each size.
 * Loops through the items and finds the color index and quantity for each size.
 * Updates the .qty div text with the quantity and adds .available class if in stock.
 */
function renderQuantities () {
  let colors = defineColors()
  colors = Array.from(colors)
  colors.forEach(function (color) {
    let newDiv = $('<div>')
    newDiv.addClass('quantities')
    $('.avail').append(newDiv)
  })
  for (let i = 0; i < sizes.length; i++) {
    let newDiv = $('<div>')
    newDiv.addClass('qty')
    newDiv.text('-')
    $('.quantities').append(newDiv)
  }
  items.forEach(function (item) {
    let color = item.color
    let colorIndex = colors.indexOf(color)
    let qty = item.qtys
    qty.forEach(function (element) {
      for (let i = 0; i < sizes.length; i++) {
        if (sizes[i] == element.size) {
          $('.quantities')
            .eq(colorIndex)
            .children()
            .eq(i)
            .text(element.qty)
            .addClass('available')
        }
      }
    })
  })
}

/**
 * Adds the selected product to the shopping basket.
 *
 * Gets the selected color and size from the DOM. Validates that a size is selected.
 * Gets the user's phone number from cookies to validate they are logged in.
 * Creates a transaction data object with user and procedure details.
 * Creates a basket data object with product details.
 * Pushes transaction and basket objects into array to send.
 * Calls registerData method to send data to the /actions endpoint.
 * Handles the response, showing a success or error message.
 */
function addToBasket () {
  let color = $('.color.active').text()
  let size = $('.size.active').text()
  if (size == '') {
    console.log('need to select ')
    flashMessage('Выберите размер')
    return false
  }
  let phone = objCookies().phone
  let session = objCookies().Session
  console.log(session, 'Session', phone, 'phone')
  if ((phone == undefined || phone == '') && session == undefined) {
    flashMessage('Вы не авторизованы')
    return false
  }
  let transData = {
    phone: objCookies().phone,
    procName: 'insert', // insert stands for add to basket procedure
    uuid: session
  }
  let basket = {
    color: color,
    size: size,
    styleid: styleid,
    qty: 1
  }
  basketArray = []
  basketArray.push(transData)
  basketArray.push(basket)
  promise = registerData(basketArray, '/actions')
  promise.done(function (data) {
    console.log(data)
    if (data[0].status == 'ok') {
      flashMessage('Товар добавлен в корзину', true)
    } else {
      flashMessage('Ошибка')
    }
  })
}
