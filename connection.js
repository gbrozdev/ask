const mongoClient = require('mongodb').MongoClient
const state = {
    db:null
}
module.exports.connect = function(done){
    const url= process.env.DATABASE_URL || 'mongodb://localhost:27017'
    const dbname='ask'

    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done() 
    })
}


module.exports.get=function(){
    return state.db
}