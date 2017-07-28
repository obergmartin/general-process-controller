
nav = document.getElementById('navigation');

c = document.createElement('a');
c.innerText = 'Devices';
c.href = 'devices.html';
nav.appendChild(c);
nav.innerHTML += ' | ';

c = document.createElement('a');
c.innerText = 'Setup';
c.href = 'setup.html';
nav.appendChild(c);
nav.innerHTML += ' | ';

c = document.createElement('a');
c.innerText = 'Manual Control';
c.href = 'manual.html';
nav.appendChild(c);
nav.innerHTML += ' | ';

c = document.createElement('a');
c.innerText = 'Status';
c.href = 'status.html';
nav.appendChild(c);
nav.innerHTML += ' | ';

c = document.createElement('a');
c.innerText = 'Data Logs';
c.href = 'loghistory.html';
nav.appendChild(c);
nav.innerHTML += ' | ';

c = document.createElement('a');
c.innerText = 'Help';
c.href = 'help.html';
nav.appendChild(c);
