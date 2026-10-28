/* Collapsible lesson navigation; keep the current lesson and scroll position. */
const sidebarViewport=window.matchMedia('(max-width:800px)');
let sidebarDesktopOpen=true;
try{sidebarDesktopOpen=localStorage.getItem('web-talim:sidebar-open')!=='false';}catch(e){}
function setSidebarOpen(open,remember=true){
 const small=sidebarViewport.matches,sidebar=document.getElementById('sidebar');
 document.body.classList.toggle('sidebar-collapsed',!small&&!open);
 sidebar.classList.toggle('open',small&&open);
 sidebar.hidden=!open;sidebar.inert=!open;
 const toggle=document.getElementById('sidebar-toggle');
 toggle.setAttribute('aria-expanded',String(open));
 toggle.setAttribute('aria-label',open?'Mavzular menyusini yashirish':'Mavzular menyusini ochish');
 document.getElementById('sidebar-backdrop').hidden=!(small&&open);
 if(!small&&remember){sidebarDesktopOpen=open;try{localStorage.setItem('web-talim:sidebar-open',String(open));}catch(e){}}
 if(!open&&sidebar.contains(document.activeElement))toggle.focus();
}
function toggleSidebar(){setSidebarOpen(document.getElementById('sidebar-toggle').getAttribute('aria-expanded')!=='true');}
function closeSidebarAfterNavigation(){if(sidebarViewport.matches)setSidebarOpen(false,false);}
sidebarViewport.addEventListener('change',()=>setSidebarOpen(sidebarViewport.matches?false:sidebarDesktopOpen,false));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.getElementById('sidebar-toggle').getAttribute('aria-expanded')==='true'){setSidebarOpen(false);document.getElementById('sidebar-toggle').focus();}});
setSidebarOpen(sidebarViewport.matches?false:sidebarDesktopOpen,false);
