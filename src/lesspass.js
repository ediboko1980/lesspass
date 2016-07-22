import './lesspass.scss'
import lesspass from 'lesspass';
import Clipboard from 'clipboard';
import domains from '../domains/domains.json';

var encryptedLogin;

function showTooltip(elem, msg) {
  var classNames = elem.className;
  elem.setAttribute('class', classNames + ' hint--top');
  elem.setAttribute('aria-label', msg);
  setTimeout(function () {
    elem.setAttribute('class', classNames);
  }, 2000);
}

window.onload = function () {
  document.getElementById('generatedPassword').value = '';
};

function getColor(color) {
  var colors = ['EBBB56', '59E0EB', 'E8F464', 'D2B4ED', 'BBE96D', 'EF9FC8', '8EE083', 'DCBFD6', 'DDD15A', 'A1C8E8', 'C4D977', 'F1A49E', '79E8A0', 'E9A970', '60E3B4', 'D4C47D', '73DDCA', 'C4EAA7', 'A7D6D4', '9CC795'];
  var index = parseInt(color, 16) % colors.length;
  return '#' + colors[index];
}

document.getElementById('login').onblur = displayPasswordIndication;
document.getElementById('masterPassword').onblur = displayPasswordIndication;
function displayPasswordIndication() {
  var login = document.getElementById('login').value;
  var masterPassword = document.getElementById('masterPassword').value;
  var fingerprint = document.getElementById('fingerprint');
  var displayMasterPasswordButton = document.getElementById('displayMasterPasswordButton');
  if (!login || !masterPassword) {
    fingerprint.innerText = '';
    fingerprint.style.display = 'none';
    displayMasterPasswordButton.style.backgroundColor = '#FFFFFF';
    return;
  }
  lesspass.encryptLogin(login, masterPassword).then(function (secretHash) {
    encryptedLogin = secretHash;
    var color = secretHash.substring(0, 6);
    var colorHex = getColor(color);
    fingerprint.innerText = color;
    fingerprint.style.display = 'inline';
    displayMasterPasswordButton.style.backgroundColor = colorHex;
    generatePassword();
  });
}

document.getElementById('copyPasswordButton').addEventListener('click', generatePassword);
document.getElementById('generatedPasswordForm').addEventListener('change', generatePassword);
document.getElementById('passwordLength').addEventListener('input', generatePassword);
document.getElementById('passwordCounter').addEventListener('input', generatePassword);
document.getElementById('generatedPasswordForm').oninput = generatePassword;
function getData() {
  const defaultOptions = {
    login: document.getElementById('login').value,
    counter: document.getElementById('passwordCounter').value,
    password: {
      length: document.getElementById('passwordLength').value,
      settings: []
    }
  };
  const options = ['lowercase', 'uppercase', 'numbers', 'symbols'];

  for (let i = 0; i < options.length; i++) {
    if (document.getElementById(options[i]).checked) {
      defaultOptions.password.settings.push(options[i]);
    }
  }
  return defaultOptions;
}

function getFormData() {
  const initData = getData();
  initData.masterPassword = document.getElementById('masterPassword').value;
  initData.site = document.getElementById('site').value;
  return initData;
}

function generatePassword() {
  const data = getFormData();
  var generatedPasswordField = document.getElementById('generatedPassword');
  if (!encryptedLogin || !data.site || !data.password.settings.length) {
    generatedPasswordField.value = '';
    return;
  }
  generatedPasswordField.value = lesspass.renderPassword(encryptedLogin, data.site, data);
}

document.getElementById('displayMasterPasswordButton').addEventListener('click', toggleMasterPassword);
function toggleMasterPassword() {
  if (document.getElementById('masterPassword').type === 'password') {
    document.getElementById('masterPassword').type = 'text';
  } else {
    document.getElementById('masterPassword').type = 'password';
  }
}

function cleanData() {
  setTimeout(function () {
    document.getElementById('generatedPassword').value = '';
    document.getElementById('masterPassword').value = '';
    document.getElementById('displayMasterPasswordButton').style.backgroundColor = '#FFFFFF';
    document.getElementById('fingerprint').innerText = '';
  }, 10000);
}

var clipboard = new Clipboard('.btn-copy');

clipboard.on('success', function (e) {
  if (e.text) {
    showTooltip(e.trigger, 'copied !');
    cleanData();
  }
});

clipboard.on('error', function () {
  cleanData();
});


document.getElementById('displayOptionsButton').addEventListener('click', toggleBlocks);

function toggleVisibility(className) {
  var elements = document.getElementsByClassName(className);
  for (var i = 0; i < elements.length; i++) {
    var e = elements[i];
    if (e.style.display === 'block') {
      e.style.display = 'none';
    } else {
      e.style.display = 'block';
    }
  }
}

function toggleBlocks() {
  toggleVisibility('option-block');
}

var list = document.getElementById('domains');

domains.forEach(function (item) {
  var option = document.createElement('option');
  option.value = item;
  list.appendChild(option);
});
