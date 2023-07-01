

    function getAndUpdate(e){
       
    
        console.log("Updating List...");
        title = document.getElementById('name').value;
       
        present = document.getElementById('present').value;
        emp=document.getElementById('empcode').value;
        month=document.getElementById('month').value;
        
        sdm=document.getElementById('sdm').value;
        sal=document.getElementById('salary').value;
        
       let paisa=sal;
let abs=0;


if(abs==0){

if(month==1 || month==3 || month==5 || month==7 || month==8 || month==10 || month==12){
abs=31-present;
salary=paisa-abs*sdm;}

if(month==2)
{
if(year%4==0)
{
abs=29-present;
}
else if((year%4)!=0)
{
abs=28-present;
}
}
if(month==4 || month==6 || month==9 || month==11){
abs=30-present;}}
if(year%4==0 || month==2 || present>29){
alert("Error");
}



/*
if(month>12 || present>31 || abs<0){
    a=false;
}*/

  /*  if(month>12 || desc>31 || abs<0){
    
        event.preventDefault();

    } */
    sal=paisa-abs*sdm;
    
       if(abs<0 || month>12 || present>31){
           
           return;
           console.log("yo");
       }
       
        
        if (localStorage.getItem('itemsJson')==null){
            itemJsonArray = [];
            itemJsonArray.push([title,emp,present,abs,sdm,sal]);
            localStorage.setItem('itemsJson', JSON.stringify(itemJsonArray))

        }
        else{
            
            itemJsonArrayStr = localStorage.getItem('itemsJson')
            itemJsonArray = JSON.parse(itemJsonArrayStr);
            itemJsonArray.push([title,emp,present,abs,sdm,sal]);
            localStorage.setItem('itemsJson', JSON.stringify(itemJsonArray))
            console.log("yeah");
        }
        
       update();
       /* if(a==false){
            a=true;
            return true;
        } */
    }
    

    function update(){
        if (localStorage.getItem('itemsJson')==null){
            itemJsonArray = []; 
            localStorage.setItem('itemsJson', JSON.stringify(itemJsonArray))
        } 
        else{
            itemJsonArrayStr = localStorage.getItem('itemsJson')
            itemJsonArray = JSON.parse(itemJsonArrayStr); 
        }
        // Populate the table
        let tableBody = document.getElementById("tableBody");
        let str = "";
        itemJsonArray.forEach((element, index) => {
            str += `
            <tr>
            <th scope="row" >${index + 1}</th>
            <a id=${index+1}><td>${element[0]}</td></a>
            <td>${element[1]}</td> 
            <td>${element[2]}</td> 
    <td>${element[3]}</td>
    <td>${element[4]}</td>
    <td>${element[5]}</td>
   
    
            <td><button class="btn btn-sm btn-primary" onclick="deleted(${index})">Delete</button></td> 
    <td><button class="btn btn-sm btn-primary" onclick="edited(${index})">Edit</button></td> 
            </tr>`; 
        });
        tableBody.innerHTML = str;
        
    }
    add = document.getElementById("add");
    add.addEventListener("click", getAndUpdate);
    update();
    function deleted(itemIndex){
        console.log("Delete", itemIndex);
        
        itemJsonArrayStr = localStorage.getItem('itemsJson')
     
        itemJsonArray = JSON.parse(itemJsonArrayStr);
        // Delete itemIndex element from the array
        itemJsonArray.splice(itemIndex, 1);
        localStorage.setItem('itemsJson', JSON.stringify(itemJsonArray));
        update();

    }
    
    
function edited(itemIndex){
    let tb= document.getElementById('tableBody');
    
   
    
    document.getElementById("name").value= tb.rows[itemIndex].cells[1].textContent;
    document.getElementById("empcode").value= tb.rows[itemIndex].cells[2].textContent;
    document.getElementById("present").value = parseInt(tb.rows[itemIndex].cells[3].textContent);
    document.getElementById("month").value = tb.rows[itemIndex].cells[4].textContent;
    document.getElementById("sdm").value = parseInt(tb.rows[itemIndex].cells[5].textContent);
    document.getElementById("salary").value = parseInt(tb.rows[itemIndex].cells[6].textContent);
    deleted(itemIndex);
    update();

}
function updateRecord(itemJsonArray) {
    let tb= document.getElementById('tableBody');
tb.rows[0].cells[0].innerHTML = itemJsonArray.title;

yo.cells[1].innerHTML = itemJsonArray.present;
yo.cells[2].innerHTML = itemJsonArray.abs;
yo.cells[3].innerHTML = itemJsonArray.sal;
}



    function clearStorage(){
        if (confirm("Do you areally want to clear?")){
        console.log('Clearing the storage')
        localStorage.clear();
        update()
        }
    }











  /*  const endpoint = 'https://gist.githubusercontent.com/Miserlou/c5cd8364bf9b2420bb29/raw/2bf258763cdddd704f8ffd3ea9a3e81d25e2c6f6/cities.json';
    
    const cities = [];
    fetch(endpoint)
      .then(blob => blob.json())
      .then(data => cities.push(...data)); */
    
   /* function findMatches(wordToMatch, itemJsonArrayStr) {
        let t=JSON.parse(itemJsonArrayStr);
      return t.filter(place => {
        // here we need to figure out if the city or state matches what was searched
        const regex = new RegExp(wordToMatch, 'gi');
       
        return t[0][0].match(regex)
      });
    } */

    function findMatches(wordToMatch, itemJsonArrayStr) {
        let t=JSON.parse(itemJsonArrayStr);
       return t.filter(element => {
        // here we need to figure out if the city or state matches what was searched
        const regex = new RegExp(wordToMatch, 'gi');
        console.log(element[0])
        return element[0].match(regex)
        
      });
    }
    
    function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    let x=true;
    function displayMatches() {
      
      
      const matchArray = findMatches(this.value, itemJsonArrayStr);
      console.log(matchArray);
      const html = matchArray.map(place => {
        const regex = new RegExp(this.value, 'gi');
        const cityName = place[0].replace(regex, `<span class="hl">${this.value}</span>`);
        let index=guess();
        return `
          <li>
            <span class="name" style="list-style-type:none"> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;<a href=#${index+1}>${cityName}</a></span>   
          </li>
        `;
      }).join('');
      suggestions.innerHTML = html;
      x=!x;
    }
    function guess(){
        let wordToMatch=findMatches(this.value,itemJsonArrayStr)
        let t=tableBody.innerHTML.match(/(\d(\")(\>)wordToMatch)/gi)
        console.log(t);
        return t;

    }


    
    const searchInput = document.querySelector('.search');
    const suggestions = document.querySelector('.suggestions');
    
    searchInput.addEventListener('change', displayMatches);
    searchInput.addEventListener('keyup', displayMatches);
  
    
//     function hide(param){
//         console.log("you are precious");
//         document.getElementById(param).style.visibility ='hidden';
//     }
// var expect=document.getElementById('expect');
//     function show(){
//         console.log("you are precious");
//         expect.classList.toggle('hideP');
//     }
   // $('#suggestions').toggle();
 /*   $('body').on('click','#suggestions', function(){
$('#suggestions').toggle();
document.getElementById('.suggestions').style.visibility ='hidden'; 
})
*/
const suggest=document.getElementById('.suggestions')





///.forEach(function(element) {
// if (element[1] == 'ID123') {
//   console.log("lo ajj m kehta hu") //'one' will delete from array
// }
//})
// submit=document.getElementById('submit');
// submit.addEventListener('click',cheky(empi));


// er=JSON.stringify(empi)

// function cheky(empi){
//   empi=document.getElementById('empi').value;
// itemJsonArray.forEach(function(element){
//   if(element[1]==empi){
// console.log(element[1]);
// show();
//   }

// })}

   