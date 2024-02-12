let path = window.location.pathname.slice(1)
let session = objCookies().Session
params = {}
const allItems = {
    brands: 'бренд',
    categories: 'категория'
}

if (session == undefined) {
    promissed = registerData({ task: 'initiate session' }, '/phone')
    promissed.done(function(data, state) {
        if (state == 'success') {
            if (data.status == 'ok') {
                console.log(objCookies().Session)
            }
        }
    })
}

async function getFilters(arg) {
    return new Promise((resolve, reject) => {
        let brands = []
        let promissed = registerData(arg, '/filters')
        promissed
            .done(function(data, state) {
                if (state === 'success') {
                    if (data.status === 'ok') {
                        brands = data.brands
                    }
                }
                resolve(brands)
            })
            .fail(function(err) {
                reject(err)
            })
    })
}

$(document).ready(async function() {
    $('.menu').removeClass('active')
    $('.menu').each(function() {
        let thisPath = $(this).children(':first-child').attr('id')
            // console.log(thisPath, path, thisPath == path)
        if (thisPath == path) {
            $(this).addClass('active')
        }

        let id = $(this).find('.gender').attr('id')
        let promo = $(this).find('.idpromo').attr('id')
        let pars = parameters()
        if (typeof pars !== 'undefined') {
            if (id == pars.gender) {
                $(this).addClass('active')
            }
            if (promo == pars.p1 && pars.p1 != undefined) {
                $(this).addClass('active')
            }
        }
    })
    const phone = objCookies().phone
    if (phone != undefined) {
        userAccount(true)
    }
    $('#logout').on('click', function() {
        console.log('logout')
        deleteAllCookies()
        userAccount(false)
    })
    var timeout = null
    let item
    let gender
    $('.dropdown').on('mouseenter touchstart', async function() {
        clearTimeout(timeout)
            // item = $(this).attr('id')
        item = $(this).attr('id').split('-')[0]
        console.log(item)

        gender = $(this).closest('.gender').attr('id')
        let pars = { gender: gender, item: allItems[item] }
        let par2 = item
        console.log(pars, 'this is pars')

        let filters = await getFilters(pars)
        console.log(filters)

        $('.' + item + '-menu').empty()
        filters.forEach(function(element) {
            console.log(element)
            let encoded = encodeURIComponent(element)
            $('.' + item + '-menu').append(
                '<div><a href="/catalog?gender=' +
                gender +
                '&' +
                par2 +
                '=' +
                encoded +
                '">' +
                element +
                '</a></div>'
            )
        })
        $(this)
            .children('.' + item + '-menu')
            .slideDown('fast')
            .css('display', 'flex')

        // Start a new timeout to hide the submenu after 10 seconds
        timeout = setTimeout(function() {
            $('.' + item + '-menu')
                .slideUp('fast')
                .css('display', 'none')
        }, 10000)
    })

    $('.dropdown').on('mouseleave', function(e) {
        // Start a new timeout to hide the submenu after 5 seconds
        timeout = setTimeout(function() {
            $('.' + item + '-menu')
                .slideUp('fast')
                .css('display', 'none')
        }, 1000)
    })

    // Stop propagation of touchstart event to prevent it from closing immediately
    $('.brands-menu').on('touchstart', function(e) {
        // e.stopPropagation()
    })
})

function deleteAllCookies() {
    try {
        document.cookie
            .split(';')
            .filter(c => c.trim() !== '')
            .forEach(cookie => {
                document.cookie =
                    cookie.split('=')[0] +
                    '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;'
            })
    } catch (e) {
        console.error(e)
    }
}

function parameters() {
    params = {}
    if (window.location.search != '') {
        let filter = window.location.search.slice(1).split('&')
        filter.forEach(function(item) {
            let param = item.split('=')
            params[param[0]] = param[1]
        })
        return params
    }
}

function thePhone(arg) {
    let tp = arg
        .replaceAll(' ', '')
        .replaceAll('-', '')
        .replace(/^8/, '')
        .replace(/^\+7/, '')
        .replaceAll('(', '')
        .replaceAll(')', '')
    return tp
}

function userAccount(arg) {
    if (arg) {
        $('.user').css('display', 'block')
        $('.incognito').css('display', 'none')
        $('#email').prop('disabled', false)
    } else {
        $('.user').css('display', 'none')
        $('.incognito').css('display', 'block')
        $('#phone').val('')
        $('#email').val('')
        $('.prefs').prop('checked', false)
    }
}

function phoneString(arg) {
    let ni = '+7-' + thePhone(arg).replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
    return ni
}

function objCookies() {
    let cookies = document.cookie.split('; ')
    let objCookies = {}
    for (let i in cookies) {
        let c = cookies[i].split('=')
        objCookies[c[0]] = c[1]
    }
    return objCookies
}

function flashMessage(message, cat, time = 2000) {
    let frontColor = cat ? 'var(--greenForgr)' : 'var(--white)'
    let backColor = cat ? 'var(--greenBack)' : 'var(--redForgr)'
    let base = $('.base-message')
    $('.message').text(message)
    console.log(message, 'message')

    base
        .slideDown(500)
        .css('display', 'flex')
        .delay(time)
        .slideUp(1000, function() {
            $(this).css('display', 'none')
        })
        .css('background-color', backColor)
        .css('color', frontColor)
}

function registerData(arg, theUrl) {
    return $.ajax({
        type: 'POST',
        url: theUrl,
        data: JSON.stringify(arg),
        contentType: 'application/json',
        dataType: 'json'
    }).done(function(data) {})
}