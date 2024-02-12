$(document).ready(function() {
    $('#loading').show()
})
$(window).on('load', function() {
    $('#loading').hide(function() {
        renderAll(params)
    })
})

function activeGender(arg) {
    $('.product').each(function() {
        let param1 = arg['gender'] // replace 'param1' with the name of your parameter
        let param2 = arg['p1'] // replace 'param2' with the name of your parameter
        let gender = $(this).find('.gender-catalog').text()
        if (param1 == 'female') {
            // console.log(param1)
            if (gender != 'ЖЕН') {
                $(this).hide()
            }
        } else {
            if (gender != 'МУЖ') {
                $(this).hide()
            }
        }
        if (param2 == 'promo') {
            let promo = $(this).find('.promo').html()
            if (promo == undefined) {
                $(this).hide()
            }
        }
    })
}

$(document).ready(function() {
    activeGender(params)

    var tickerText = [
            'Промо-акция до 31 января',
            'Промо и обычная скидка одновременно',
            'Вы можете купить товар без регистрации',
            'В этом случае вам нужно записать код',
            'ИЛИ',
            'Зарегистрируйтесь и получите SMS',
            'для получения товара'
        ] // List of text strings

    //   var colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'] // List of colors
    var colors = [
            'rgba(240, 0, 0)',
            'rgba(0, 0, 240)',
            'rgba(0, 128, 0)',
            'rgba(240, 240, 0)',
            'rgba(128, 0, 128)',
            'rgba(240, 165, 0)'
        ] // List of pale colors

    var tickerIndex = 0 // Initialize index to display the first string first

    function ticker() {
        // Function to update the ticker text
        $('#ticker').animate({ left: '-100%' }, 500, function() {
            $(this)
                .css('overflow', 'hidden')
                .css('white-space', 'nowrap')
                .css('left', '100%')
                .html(tickerText[tickerIndex])
                .css('background-color', generatePaleColor())
                .animate({ left: '0' }, 500)
        })
        tickerIndex++ // Move to the next string
        if (tickerIndex >= tickerText.length) tickerIndex = 0 // If we've gone beyond the last string, start over
    }

    ticker() // Call the function once to initialize
    setInterval(ticker, 5000) // Call the function every 3 seconds
})

function generatePaleColor() {
    var hue = Math.floor(Math.random() * 360) // Random hue
    var saturation = 85
    var lightness = 90 // High lightness
    return `hsl(${hue}, ${saturation}%, ${lightness}%)` // Return the HSL color string
}

function renderAll(params) {
    let brand =
        params.brands !== undefined ? decodeURIComponent(params.brands) : undefined
    let category =
        params.categories !== undefined ?
        decodeURIComponent(params.categories) :
        undefined

    if (typeof brand !== 'undefined') {
        console.log(brand, 'filter')
        $('.product').each(function() {
            let currentBrand = $(this).find('.brand').text()
            if (brand != currentBrand) {
                $(this).hide()
            }
        })
    } else if (typeof category !== 'undefined') {
        $('.product').each(function() {
            let currentCategory = $(this).find('.categories').text()
            if (category != currentCategory) {
                $(this).hide()
            }
        })
    }
    $('.products').show().css('display', 'grid')
}