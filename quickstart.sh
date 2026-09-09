# Make sure you are in the main project directory, not inside docs/
python3 -m http.server 8080 &
sleep 2
open http://localhost:8080/docs/style-guide.html
