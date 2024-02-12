// console.log('hello there')
// $(document).ready(function () {
//   var currentSlide = 0
//   var numSlides = $('#carousel .slide').length

//   function nextSlide () {
//     $('#carousel .slide').eq(currentSlide).css('left', '-100%')
//     currentSlide = (currentSlide + 1) % numSlides
//     $('#carousel .slide').eq(currentSlide).css('left', '0')
//   }

//   setInterval(nextSlide, 3000) // Change slide every 3 seconds
// })

// $(document).ready(function () {
//   var $slides = $('#carousel .slide')
//   var currentSlide = 0
//   var slideInterval = setInterval(nextSlide, 3000)

//   // Initial setup: Show the first slide immediately
//   $($slides[currentSlide]).css('left', '0')

//   function nextSlide () {
//     $($slides[currentSlide]).animate({ left: '-100%' }, 1000) // Slide out current slide

//     currentSlide++
//     if (currentSlide >= $slides.length) {
//       currentSlide = 0
//     }

//     $($slides[currentSlide]).css('left', '100%').animate({ left: '0' }, 1000) // Slide in next slide
//   }
// })

p = images
    .replaceAll('&#39;', '"')
    .replaceAll('}, {', '},{')
    .replaceAll('  ', ' ')
    //   .replaceAll(': ', '": "')
    //   .replaceAll(', ', '", "')
    .replaceAll('}', '"}')
    .replaceAll('{', '{"')
p = JSON.parse(p)

// console.log(images, p)

$(document).ready(function() {
    var $slides = $('#carousel .slide')
    var currentSlide = 0
    var slideInterval = setInterval(nextSlide, 4000)

    // Hide all slides initially
    $slides.hide()

    // Initial setup: Show the first slide immediately
    $($slides[currentSlide]).fadeIn(1000)

    function nextSlide() {
        $($slides[currentSlide]).fadeOut(1000)

        currentSlide++
        if (currentSlide >= $slides.length) {
            currentSlide = 0
        }

        $($slides[currentSlide]).fadeIn(1000)
    }
})