#! /usr/local/bin/node

const TransIp = require('transip');
const publicIp = require('public-ip');
const env = require('node-env-file');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));
const homedir = require('homedir')();

const privateKeyPath = `${homedir}/.transip-key`;
const envPath = `${homedir}/.transip-dyndns`;
const nameArg = argv.n;
const dnsName = nameArg || 'dyndns';

env(envPath);

const domain = process.env.DOMAIN;
const login = process.env.LOGIN;
let transIp;

function getDnsEntries() {
  return new Promise((resolve) => {
    transIp.domainService.getInfo(domain).then((info) => {
      resolve(info.dnsEntries);
    });
  });
}

function addDnsEntries(currentDnsEntries, name, content) {
  if (!(currentDnsEntries && currentDnsEntries.length)) {
    throw Error('addDnsEntries should get the current dnsEntries as the first argument');
  }

  const newDnsEntries = [...currentDnsEntries];
  const dynDnsRecord = {
    name,
    expire: 300,
    type: 'A',
    content,
  };
  const dynDnsIndex = currentDnsEntries.findIndex((item) => item.name === dnsName);

  if (dynDnsIndex > -1) {
    newDnsEntries[dynDnsIndex] = dynDnsRecord;
  } else {
    newDnsEntries.push(dynDnsRecord);
  }

  return newDnsEntries;
}

function setDnsEntries(dnsEntries) {
  return transIp.domainService.setDnsEntries(domain, {
    item: dnsEntries,
  });
}

function addDynDns() {
  let ip = null;
  publicIp.v4()
    .then((currentPublicIp) => {
      ip = currentPublicIp;
    })
    .then(getDnsEntries)
    .then((dnsEntries) => {
      const newDnsEntries = addDnsEntries(dnsEntries, dnsName, ip);
      return setDnsEntries(newDnsEntries);
    }).then((response) => {
      if (response === true) {
        console.log('Succesfully added/changed the DNS record.\n');
      } else {
        console.log('Something might have gone wrong adding/changing the DNS record.\n');
      }
    });
}

fs.readFile(privateKeyPath, 'utf8', (error, key) => {
  const privateKey = key;
  transIp = new TransIp(login, privateKey);

  addDynDns();
});
