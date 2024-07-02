const fs = require('fs');

const users = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
);


exports.getAllUsers = (req, res) => {
  res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
        users: users,
        },
  });
};


exports.getUser = (req, res) => {
  const id = req.params.id * 1;
  const user = users.find((el) => el.id === id);

    res.status(200).json({
        status: 'success',
        data: {
        user,
        },
    });
};
