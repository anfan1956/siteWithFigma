flashTime = 3000
let thisPhone = objCookies().phone
if (objCookies().phone != undefined) {
  $('#phone').val(phoneString(objCookies().phone))
  promissed = registerData({ task: 'get-email-prefs' }, '/phone')
  promissed.done(function (data, state) {
    if (state == 'success') {
      if (data.status == 'ok') {
        $('#email').val(data.email)
      }
      if (data.prefs == undefined) {
        $('#sales').prop('checked', data.sales)
        $('#collections').prop('checked', data.collections)
        $('#receipts').prop('checked', data.receipts)
      }
    }
  })
} else {
  $('#email').prop('disabled', true)
}

$('#prefs-button').click(function () {
  let phone = thePhone($('#phone').val())
  promissed = registerData(prefsUpdate(phone), '/phone')
  promissed.done(function (data, state) {
    if (state == 'success') {
      if (!data.error) {
        flashMessage('настройки оповещений записаны', true, flashTime)
      } else {
        flashMessage(data.error, false, flashTime)
      }
    }
  })
})

function prefsUpdate (phone, deleteMail = false) {
  let prefData = {
    phone: phone,
    task: 'prefs-update'
  }
  if (deleteMail == false) {
    prefData.task = 'prefs-update'
    prefData.receipts = $('#receipts').prop('checked')
    prefData.collections = $('#collections').prop('checked')
    prefData.sales = $('#sales').prop('checked')
    prefData.promos = $('#sales').prop('checked')
  } else {
    prefData.task = 'delete-email'
  }
  return prefData
}

let phone = ''
let numString = ''
let $modal = $('#digitModal')
let $inputs = $('.digit-input')
var procData = {}

$(document).ready(function () {
  $('#email').on('focus', emailInput)
  $('#phone-button').click(function () {
    let phone = thePhone($('#phone').val())
    procData = {
      phone: phone,
      task: 'get-sms-code'
    }
    if (thisPhone == undefined) {
      $('#phone').focus()
    } else {
      $('#phone').val(phoneString(thisPhone))
    }
    getCode(procData)
  })

  $('#email-button').click(function () {
    let email = $('#email').val()
    let phone = thePhone($('#phone').val())
    procData.phone = phone
    procData = {
      phone: phone,
      task: 'get-email-code',
      email: email
    }
    getCode(procData)
  })
  if (thisPhone == undefined) {
    $('#phone').focus()
  } else {
    $('#phone').val(phoneString(thisPhone))
  }
})

function getCode (procData) {
  if (formatInput()) {
    // console.log(procData)
    promissed = registerData(procData, '/phone')
    promissed.done(function (data, state) {
      //   console.log(state, ' the state')

      if (state == 'success') {
        if (data.sms_sent) {
          procData.task = 'verify-sms-code'
        } else if (data.email_result) {
          procData.task = 'verify-email'
        }
        getNumString()
      }
    })
  }
}

$inputs.on('keyup', function () {
  numString += $(this).val()
  if ($(this).attr('id') == 'di-4') {
    procData.code = numString
    $modal.hide()
    $('#login-container').css('opacity', '1')
    let promised = registerData(procData, '/phone')
    promised.done(function (data, state) {
      if (state == 'success') {
        if (data.status == 'ok') {
          $('#email').val(data.email)
          if (data.prefs == undefined) {
            $('#sales').prop('checked', data.sales)
            $('#collections').prop('checked', data.collections)
            $('#receipts').prop('checked', data.receipts)
          } else {
            $('#sales').prop('checked', false)
            $('#collections').prop('checked', false)
            $('#receipts').prop('checked', false)
          }
          if (data.message) {
            flashMessage(
              'Вы авторизованы. Ваш промокод:' +
                objCookies().promo +
                '\n' +
                'действует на сайте автоматически \nОтправлен в СМС для покупок а магазине',
              true,
              (time = 5000)
            )
          }
          numString = ''
          userAccount(true)
          return false
        } else {
          flashMessage(data.message, false, (time = 3000))
          document.cookie =
            'cookiename=phone ; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
          userAccount(false)
        }
      }
    })
  }
  var $next = $(this).next('.digit-input')
  $next.focus()
})

function getNumString () {
  numString = ''
  $modal.show()
  $('#di-1').focus()
  $inputs.each(function () {
    $(this).val('')
  })
  $('#login-container').css('opacity', '0.1')
}

document.getElementById('closeButton').addEventListener('click', function () {
  document.getElementById('digitModal').style.display = 'none'
  $('#login-container').css('opacity', '1')
})

function formatInput () {
  var input = $('#phone')
  let phone = thePhone($('#phone').val())
  let properFormat = checkPhoneFormat(phone)
  if (properFormat == false) {
    $('#login-container').css('opacity', '.1')
    flashMessage('Неверный формат телефона', false, (time = 3000))
    $('#login-container').css('opacity', '1')
    setTimeout(function () {
      input.val('')
      return false
    }, 3500)
  } else {
    input.val(phoneString(phone))
    return true
  }
}

function checkPhoneFormat (phone) {
  if (isNaN(phone) || phone.length != 10) {
    return false
  } else return true
}

function emailInput () {
  let escapePressed = false
  let $email = $('#email').val()
  console.log($email)
  $('#email').val('')

  $('#email').on('keydown', function (event) {
    if (event.key === 'Escape') {
      escapePressed = true
      $(this).val($email)
    }
  })
}
