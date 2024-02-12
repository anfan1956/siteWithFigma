const b = content
  .replaceAll('&#39;', '')
  .replaceAll('}, {', '},{')
  .replaceAll('  ', ' ')
  .replaceAll(': ', '": "')
  .replaceAll(', ', '", "')
  .replaceAll('}', '"}')
  .replaceAll('{', '{"')
p = JSON.parse(b)

$('.left').each(function () {
  let text = $(this).text()
  text = text.toLowerCase()
  $(this).text(text)
})

$('#delivery option').each(function () {
  $('#delivery').parent().css('background-color', 'var(--redBack)')
  let value = $(this).val()
  let search = window.location.search.split('=')
  $option = search.slice(1)[0]
  if ($.isNumeric($option)) {
    console.log($option, 'this is the adrr')
    $('#delivery').val($option)
    $('#delivery').parent().css('background-color', 'var(--greenBack)')
    return false
  } else if ($.isNumeric(value) && value > 0) {
    console.log(value)
    $('#delivery').val(value)
    $('#delivery').parent().css('background-color', 'var(--greenBack)')
    return false
  }
})

$(document).ready(function () {
  // Add an event listener to the select element
  $('#delivery').on('change', function () {
    // Get the selected option value
    const selectedValue = $(this).val()

    // Check if the selected value is 0
    if (selectedValue === '0') {
      // Redirect to "/delivery"
      window.location.href = '/delivery'
    }
  })

  /**
   * Attaches click handlers to quantity changer elements
   * to update the product quantity and call basket actions.
   *
   * Gets product data from closest ancestor elements,
   * increments/decrements quantity within min/max limits,
   * updates DOM elements with new quantity.
   *
   * On quantity change, calls piecesSelected() and basketAction()
   * to handle selection state and trigger API calls.
   */
  $('.changer').each(function () {
    let styleid = $(this).closest('.card').find('[name="styleid"]').text()
    let color = $(this).closest('.card').find('[name="color"]').text()
    let size = $(this).closest('.card').find('[name="size"]').text()
    let min = 0
    let max = parseInt($(this).closest('.card').find('.qty-limit').text())
    $(this).on('click', function () {
      let task = $(this).attr('name') == 'plus' ? 'insert' : 'remove'
      let count = $(this).closest('.counter').find('.count').text()
      if (task === 'insert') {
        if (count == max) {
          flashMessage('максимальное количество - ' + max + ' шт.')
          return false
        }
        count++
        $(this).closest('.counter').find('.count').text(count)
      } else {
        count == min ? count : count--
        $(this).closest('.counter').find('.count').text(count)
        if (count == min) {
          flashMessage('Товар удален')
        }
      }
      let product = {
        styleid: styleid,
        color: color,
        size: size,
        qty: 1
      }
      piecesSelected()
      basketAction(product, task)
    })
  })

  /**
   * Iterates through all elements with the .checkbox class
   * and attaches a click handler to each one.
   * The click handler calls the piecesSelected() function.
   */
  $('.checkbox').each(function () {
    $(this).on('click', function () {
      piecesSelected()
    })
  })
  /**
   * Iterates through all buttons with the .btn class
   * and attaches a click handler to each.
   * The click handler gets the button's id property
   * and passes it to the action() function.
   * This allows different actions to be taken
   * depending on which button was clicked.
   */
  $('.btn').each(function () {
    let id = $(this).prop('id')
    $(this).on('click', function () {
      let id = $(this).prop('id')
      console.log(id)

      action(id)
    })
  })
})

/**
 * basketAction performs the basket action by calling the API
 * with the given task (insert/remove) and product data.
 * It handles the API response and reloads the page or displays
 * error messages as needed.
 */
function basketAction (arg, task) {
  let json = []
  userData = {
    procName: task,
    phone: objCookies().phone,
    session: objCookies().Session
  }
  json.push(userData)
  json.push(arg)
  let promissed = registerData(json, '/actions')
  promissed.done(function (data, state) {
    data = data[0]
    // console.log(data)
    if (state == 'success') {
      if (data.status == 'ok') {
        if (data.this == 0) {
          location.reload(true)
        }
      } else {
        flashMessage(data.message)
      }
    }
  })
}

/**
 * action performs the purchase or remove action for the selected basket items.
 * It collects the selected items, creates the request payload with delivery info,
 * calls the API, and reloads the page on success.
 */
function action (id) {
  let deliveryData = {}
  let products = []
  let checked = piecesSelected() == 0 ? false : true
  $('.card').each(function () {
    if ($(this).find('.basket-checkbox').prop('checked') == checked) {
      let styleid = $(this).find('[name ="styleid"]').text()
      let color = $(this).find('[name = "color"]').text()
      let size = $(this).find('[name = "size"]').text()
      let qty = $(this).find('.count').text()
      let product = {
        styleid: styleid,
        color: color,
        size: size,
        qty: qty
      }
      products.push(product)
    }
  })
  let procName = id === 'buy-btn' ? 'purchase' : 'remove'
  console.log(procName)

  deliveryData.procName = procName
  deliveryData.pickupid = $('#delivery').val().split('-')[1]
  deliveryData.session = session
  deliveryData.phone = objCookies().phone
  products.unshift(deliveryData)
  promise = registerData(products, '/actions')
  promise.done(function (data) {
    if (data[0].status == 'ok') {
      location.reload(true)
    }
  })
}
/**
 * piecesSelected counts the selected items in the basket
 * and updates the total pieces and price.
 * It also updates the text of the action buttons based on
 * whether any items are selected.
 */
function piecesSelected () {
  let total = 0
  let pieces = 0
  $('.card').each(function () {
    let count = parseInt($(this).find('.count').text())
    let price = parseInt(
      $(this).find('.final-price').text().split(' ')[0].replace(',', '')
    )
    if ($(this).find('input').prop('checked')) {
      pieces += count
      total += count * price
    }
  })
  $('#pieces').text(pieces)
  total = total.toLocaleString('en-US', { minimumFractionDigits: 0 })
  $('#total').text(total)
  if (pieces == 0) {
    $('.btn.del').text('удалить все')
    $('.btn.buy').text('купить все')
  } else {
    $('.btn.del').text('удалить отмеченное')
    $('.btn.buy').text('купить отмеченное')
  }
  return pieces
}
