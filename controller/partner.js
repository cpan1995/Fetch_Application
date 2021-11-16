const { application } = require("express");
const { resource, request } = require("../app");


let transactionDict = new Array()
let totalPartner = {}
let total = 0
let ans = {}

const sortPartners = () => {
    transactionDict.sort((x,y) => {
        return new Date(x.timestamp) - new Date(y.timestamp)
    })
}

const add = (map, info, points = null) => {
    if (points){
        if(map[info.payer]){
            map[info.payer] += points
        } else {
            map[info.payer] = points
        }
    } 
    else{
        if(map[info.payer]){
            map[info.payer] += info.points
        } else {
            map[info.payer] = info.points
        }
    }
}

const partnerController = {
    addTransaction (req, res) {
        const requestBody = req.body;
        transactionDict.push(requestBody)
        sortPartners()
        add(totalPartner, requestBody)
        total += requestBody.points
        res.json(transactionDict)
    },
    spend (req,res) {
        let currentPoints = req.body.points
        if(total < currentPoints){
            res.json({"Message": "There isn't enough points!"})
        }
        for (let i = 0; i<transactionDict.length; i++){
            if(currentPoints <= 0){
                break;
            }

            if(transactionDict[i].points < 0 && totalPartner[transactionDict[i].payer] > 0){
                add(ans, transactionDict[i])
                currentPoints -= transactionDict[i].points
                continue
            }
            if(transactionDict[i].points > 0 && totalPartner[transactionDict[i].payer] > 0){
                if(transactionDict[i].points - currentPoints > 0){
                    add(ans, transactionDict[i], currentPoints)
                    let final = []
                    for(let key in ans){
                        final.push({'payer': key, 'points': ans[key]*-1})
                    }
                    return res.json(final)
                } 
                currentPoints -= transactionDict[i].points
                add(ans, transactionDict[i])
            }
        }
    },
    all (req, res) {
        for(let key in totalPartner){
            if(ans[key]){
                totalPartner[key] -= ans[key]
            }
        }
        res.json(totalPartner)
    }
}

module.exports = partnerController