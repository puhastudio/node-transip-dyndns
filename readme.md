# DEPRECATED
Please see https://github.com/marklagendijk/node-transip-dns-cli

# node-transip-dyndns

> A npm module which adds a DNS record with the current public ip to transip.

## Configuration
These files are expected to be in the user's home folder.

    .transip-dyndns
    .transip-key

## Installation
`npm install -g transip-dynds`

## Usage
```
Add a record with the default name 'dyndns'
$ transip-dyndns

Pass the name of the record with -n
$ transip-dyndns -n name
```
