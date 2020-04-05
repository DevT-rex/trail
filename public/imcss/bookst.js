var modal = document.getElementsByClassName('modaldia')[0];

var opmodal = document.getElementsByClassName('new1')[0];
var clomodal = document.getElementsByClassName('close')[0];
var t= 0;
clomodal.addEventListener('click',Modal);
opmodal.addEventListener('click',Modal);
function Modal(){
    if(t%2==0){
        modal.style.display='block';
         t=t+1; 
       console.log(modal);  
    }
    else{
        modal.style.display='none';
        t=t+1;
    }
}
