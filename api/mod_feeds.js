const { query } = require('./dbConnect.js');

const getAllModFeeds = () => {
    return new Promise((resolve, reject) => {
        query('SELECT * FROM mod_feeds', [], (error, result) => {
            if (error) return reject(error);
            resolve(result.rows);
        });
    });
}

const getModFeed = (feedId) => {
    return new Promise((resolve, reject) => {
        query('SELECT * FROM mod_feeds WHERE _id = $1', [feedId], (error, result) => {
            if (error) return reject(error);
            resolve(result.rows);
        });
    });
}

const getModFeedsForServer = (serverId) => {
    return new Promise((resolve, reject) => {
        query('SELECT * FROM mod_feeds WHERE guild = $1', [serverId], (error, result) => {
            if (error) return reject(error);
            resolve(result.rows);
        });
    });
}

const createModFeed = (newFeed) => {
    return new Promise(
        (resolve, reject) => {
        query('INSERT INTO mod_feeds (channel, guild, owner, domain, mod_id, title, nsfw, last_timestamp, created) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [newFeed.channel, newFeed.guild, newFeed.owner, newFeed.domain, newFeed.title, newFeed.nsfw, Date(0), new Date()], 
        (error, results) => {
            if (error) {
                //throw error;
                console.log(error);
                if (error.code === "23505") return reject(`Error ${error.code} - The field ${error.constraint} is not unique.`);
            };
            resolve(true);
        })
    });
}

const updateModFeed = (feedId, newData) => {
    return new Promise(async (resolve, reject) => {
        let errors = 0;
        Object.keys(newData).forEach((key) => {
            query(`UPDATE mod_feeds SET ${key} = $1 WHERE _id = $2`, [newUser[key], feedId], (error, results) => {
                if (error) errors += 1;
            });
        });
        if (errors > 0) resolve(false);
        else resolve(true);
    });
}

const deleteModFeed = (feedId) => {
    return new Promise((resolve, reject) => {
        query('DELETE FROM mod_feeds WHERE _id = $1', [feedId], (error, result) => {
            if (error) return reject(error);
            resolve(result.rows);
        });
    });
}

module.exports = { getAllModFeeds, getModFeed, getModFeedsForServer, createModFeed, updateModFeed, deleteModFeed };