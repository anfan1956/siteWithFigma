// $(document).ready(function () {
//   var currentSlide = 0
//   var numSlides = $('#carousel .slide').length

//   function nextSlide () {
//     console.log('hello there')
//     $('#carousel .slide').eq(currentSlide).css('left', '-100%')
//     currentSlide = (currentSlide + 1) % numSlides
//     $('#carousel .slide').eq(currentSlide).css('left', '0')
//   }

//   setInterval(nextSlide, 3000) // Change slide every 3 seconds
// })

// $(document).ready(function () {
//   var $slides = $('#carousel .slide')
//   var currentSlide = 0

//   // Initial setup: Hide all slides and show the first one
//   $slides.css('display', 'block')
//   $slides.css('left', '100%')
//   $($slides[currentSlide]).css('left', '0')

//   var slideInterval = setInterval(nextSlide, 2500)

//   // Initial setup: Show the first slide immediately
//   $($slides[currentSlide]).css('left', '0')

//   function nextSlide () {
//     $($slides[currentSlide]).animate({ left: '-100%' }, 800) // Slide out current slide

//     currentSlide++
//     if (currentSlide >= $slides.length) {
//       currentSlide = 0
//     }

//     $($slides[currentSlide]).css('left', '100%').animate({ left: '0' }, 800) // Slide in next slide
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

$(document).ready(function () {
  var $slides = $('#carousel .slide')
  var currentSlide = 0

  //   setInterval is JavaScript function that calls some other function as specific interval
  setInterval(nextSlide, 2500)

  // Hide all slides initially
  $slides.hide()

  // Initial setup: Show the first slide immediately
  $($slides[currentSlide]).fadeIn(500)

  function nextSlide () {
    $($slides[currentSlide]).fadeOut(500)

    currentSlide++
    if (currentSlide >= $slides.length) {
      currentSlide = 0
    }
    $($slides[currentSlide]).fadeIn(1000)
  }
})
