#!/bin/bash

# Create the directory if it doesn't exist
mkdir -p public/logos

# Download popular tech company logos
curl -o public/logos/microsoft.svg "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg"
curl -o public/logos/google.svg "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
curl -o public/logos/amazon.svg "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
curl -o public/logos/apple.svg "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
curl -o public/logos/netflix.svg "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
curl -o public/logos/facebook.svg "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
curl -o public/logos/twitter.svg "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg"
curl -o public/logos/spotify.svg "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
curl -o public/logos/adobe.svg "https://upload.wikimedia.org/wikipedia/commons/7/7b/Adobe_Systems_logo_and_wordmark.svg"

echo "All logos downloaded!"
