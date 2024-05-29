function start_plant_window(){
  add_plant_widget()
  age = fetch_plant_lifespan()
  has_been_watered = fetch_watered_status()
  display_plant(age)
  add_water_button()
}
function add_plant_widget(){
  var container = document.getElementById("plantcontainer")
  var plantdiv = document.createElement("div")
  plantdiv.classList.add("plantdiv")
  plantdiv.innerHTML = '<p> this is a test </p>'
  container.appendChild(plantdiv)
}
function fetch_plant_lifespan(){
  var age = 5
  return age
}
function fetch_watered_status(){
  var has_been_watered = true
  return has_been_watered
}
function display_plant(age){

}
function add_water_button(){

}
