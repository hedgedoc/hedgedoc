# Slide Separators

If you're getting started with reveal.js slides, there are a few things you need to know.

There are two types of slides, those that transition horizontally and those that transition vertically (subslides).

The following separators are used for each in the HedgeDoc syntax:

```markdown
# First Slide

---

# Next slide

----

## Subslide
```
as you can see, horizontal transitions are separated by `---` and vertical transitions by `----`

## Basic YAML header
It's possible to customise the slide options using the YAML header in the slide markdown.

eg:
```yaml
---
title: Example Slide
tags: presentation
slideOptions:
  theme: solarized
  transition: 'fade'
  # parallaxBackgroundImage: 'https://s3.amazonaws.com/hakim-static/reveal-js/reveal-parallax-1.jpg'
---
```
make sure to have two spaces only at the start of the listed slide options.

you can comment out options with a `#`

### Some other options

```markdown
# Display controls in the bottom right corner
controls: true

# Display a presentation progress bar
progress: true

# Set default timing of 2 minutes per slide
defaultTiming: 120

# Display the page number of the current slide
slideNumber: false

# Push each slide change to the browser history
history: false

# Enable keyboard shortcuts for navigation
keyboard: true

# Enable the slide overview mode
overview: true

# Vertical centering of slides
center: true

# Enables touch navigation on devices with touch input
touch: true

# Loop the presentation
loop: false

# Change the presentation direction to be RTL
rtl: false

# Randomizes the order of slides each time the presentation loads
shuffle: false

# Turns fragments on and off globally
fragments: true

# Flags if the presentation is running in an embedded mode,
# i.e. contained within a limited portion of the screen
embedded: false

# Flags if we should show a help overlay when the questionmark
# key is pressed
help: true

# Flags if speaker notes should be visible to all viewers
showNotes: false

# Global override for autolaying embedded media (video/audio/iframe)
# - null: Media will only autoplay if data-autoplay is present
# - true: All media will autoplay, regardless of individual setting
# - false: No media will autoplay, regardless of individual setting
autoPlayMedia: null

# Number of milliseconds between automatically proceeding to the
# next slide, disabled when set to 0, this value can be overwritten
# by using a data-autoslide attribute on your slides
autoSlide: 0

# Stop auto-sliding after user input
autoSlideStoppable: true

# Use this method for navigation when auto-sliding
autoSlideMethod: Reveal.navigateNext

# Enable slide navigation via mouse wheel
mouseWheel: false

# Hides the address bar on mobile devices
hideAddressBar: true

# Opens links in an iframe preview overlay
previewLinks: false

# Transition style
transition: 'slide' 
# none/fade/slide/convex/concave/zoom

# Transition speed
transitionSpeed: 'default'
# default/fast/slow

# Transition style for full page slide backgrounds
backgroundTransition: 'fade'
# none/fade/slide/convex/concave/zoom

# Number of slides away from the current that are visible
viewDistance: 3

# Parallax background image
parallaxBackgroundImage: ''
# e.g. "'https://s3.amazonaws.com/hakim-static/reveal-js/reveal-parallax-1.jpg'"

# Parallax background size
parallaxBackgroundSize: ''
# CSS syntax, e.g. "2100px 900px"

# Number of pixels to move the parallax background per slide
# - Calculated automatically unless specified
# - Set to 0 to disable movement along an axis
parallaxBackgroundHorizontal: null
parallaxBackgroundVertical: null

# The display mode that will be used to show slides
display: 'block'
```

## Customising individual slides

custom background image:

```markdown
---

<!-- .slide: data-background="https://s3.amazonaws.com/hakim-static/reveal-js/reveal-parallax-1.jpg" -->
#### testslide

---
```

## Speaker notes and speaker view

You can add speaker notes to your slides. 

```markdown
# Example slide

Slide content

<aside class="notes">
Notes go here
</aside>
```

The notes are not displayed in the presentation view, but you can press `S` there to open a new window with the speaker view. 

Both speaker notes and speaker view are features of reveal.js, you can read more in their documentation: https://revealjs.com/speaker-view/
