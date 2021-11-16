const { application } = require("express");
const { resource, request } = require("../app");

//Gobal variables specifically for this task
let transactionDict = new Array()
let totalPartner = {}
let total = 0
let ans = {}


//sorts transactionDict by timestamp from oldest to newest
const sortPartners = () => {
    transactionDict.sort((x,y) => {
        return new Date(x.timestamp) - new Date(y.timestamp)
    })
}

//Helper Function adds elements into an object.
//Cleaned up the code saw that there was alot of redundant code.
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

//controllers for 3 endpoints. Normally i would have put the bulk of the logic
//in models but since data isn't persistent i put the logic in the controller instead
const partnerController = {
    addTransaction (req, res) {
        //everytime a new post request is sent the it stores the transactions into an array
        //that array if sorted by calling sortPartners(). Adds all of the totalPoints each partner has
        //in an object for later use. plus a helper total variable to check the total amount of a points
        //for all partners
        const requestBody = req.body;
        transactionDict.push(requestBody)
        sortPartners()
        add(totalPartner, requestBody)
        total += requestBody.points
        res.json(transactionDict)
    },
    spend (req,res) {
        //the approach for this was to keep subtracting from the points until the value hits 0
        //Once it does hit zero it'll print out the array of objects of the points spent by oldest to newest
        //for each payer
        let currentPoints = req.body.points

        //checks if request is a negative number
        if(currentPoints < 0){
            return res.json({'Message': "Can't spend negative points"})
        }

        if(total < currentPoints){
            //Handles an edge case where if the total points for all payers is less than the the points allowed to spend
            //it returns with a message saying there's not enough points
            return res.json({"Message": "There isn't enough points!"})
        }
        for (let i = 0; i<transactionDict.length; i++){
            //this statement checks if the points is negative and if the totalPoints the person has is greater than zero.
            //There was an edge case where a payer had negative points. This checks for that
            if(transactionDict[i].points < 0 && totalPartner[transactionDict[i].payer] > 0){
                add(ans, transactionDict[i])
                currentPoints -= transactionDict[i].points
                continue
            }
            //checks if the points of the current iteration of transactionDict is greater than 0
            //and *again* if the total points of that person is greater than 0
            if(transactionDict[i].points > 0 && totalPartner[transactionDict[i].payer] > 0){
                //checks if the currentPoints subtracted from the points of the current iteration is greater than 0
                //meaning if there's still points left over from spending all of the currentPoints It'll trigger this
                //and returns the res.json()
                if(transactionDict[i].points - currentPoints > 0){
                    add(ans, transactionDict[i], currentPoints)
                    let final = []
                    //converts the final ans object into the correct format. Array of Objects
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
        //subtracts the values of ans from totalPartner and return the adjust amount after
        //spending the points. I think this part of should have been in the spend endpoint but im probably gonna leave this here
        //since the scope of the assignment was met.
        for(let key in totalPartner){
            if(ans[key]){
                totalPartner[key] -= ans[key]
            }
        }
        res.json(totalPartner)
    }
}

module.exports = partnerController