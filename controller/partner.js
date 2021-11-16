const { application } = require("express");
const { resource, request } = require("../app");


let storePartner = {}
let transactionDict = new Array()
let totalPartner = {}

const sortPartners = () => {
    transactionDict.sort((x,y) => {
        return new Date(x.timestamp) - new Date(y.timestamp)
    })
}

const add = (map, info) => {
    if(map[info.payer]){
        map[info.payer] += info.points
    }
    else{
        map[info.payer] = info.points
    }
}

const partnerController = {
    addTransaction (req, res) {
        const requestBody = req.body;
        transactionDict.push(requestBody)
        sortPartners()
        add(totalPartner, requestBody)
        res.json(transactionDict)
    },
    spend (req, res) {
        let currentPoints = req.body.points;
        let results = []
        for (let i = 0; i<transactionDict.length; i++){
            if(currentPoints <= 0){
                for (const [key, value] of Object.entries(storePartner)){
                    let newObject = {'payer': key , 'points': value*-1}
                    results.push(newObject)
                }
                break;
            }
            add(storePartner, transactionDict[i])

            if(transactionDict[i].points < 0){
                currentPoints -= transactionDict[i].points
                continue;
            } else {
                if(currentPoints - storePartner[transactionDict[i].payer] < 0){
                    storePartner[transactionDict[i].payer] = currentPoints
                }
                currentPoints -= storePartner[transactionDict[i].payer]
            }
        }
        console.log(storePartner)
        res.json(results)
    },
    all (req, res) {
        for (const [key, value] of Object.entries(totalPartner)) {
            totalPartner[key] -= storePartner[key]
        }
        console.log(totalPartner)
        res.json(totalPartner)
    }
}

module.exports = partnerController