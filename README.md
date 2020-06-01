# covidping-image-generation (discontinued)

Firebase Cloud Function project to generate, store, and serve images from Covid-19 statistics. Created for use by https://www.covidping.com.

Images are intended for use as Twitter cards. Twitter-friendly links are https://covidpingimages.web.app/[State-Abbreivation]?[no-cache]

Images are updated by sending a POST request to https://covidpingimages.web.app/update/[State-Abbreviation] containing an HTML string in the request body.

Images are retrieved by sending a GET request to https://covidpingimages.web.app/image/[State-Abbreviation].
