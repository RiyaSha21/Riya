const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const dataFilePath = path.join(__dirname, 'data.txt');

// Middleware to parse URL-encoded request bodies (form data)
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Route to handle reading the file and displaying its content
app.get('/', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }

        // Split the data into lines
        const lines = data.trim().split('\n').filter(line => line.trim() !== '');

        // Generate table rows
        const rows = lines.map((line, index) => {
            const [name, salary] = line.split('|');
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${name}</td>
                    <td>${salary}</td>
                </tr>
            `;
        }).join('');

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Salary Management</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        background-color: #d1eaf2;
                    }
                    h1 {
                        color: #333;
                    }
                    form {
                        margin-bottom: 20px;
                    }
                    label {
                        margin-right: 10px;
                        font-weight: bold;
                    }
                    input[type="text"] {
                        padding: 5px;
                        margin-right: 10px;
                    }
                    button {
                        padding: 5px 10px;
                        background-color: #fa1a3f;
                        color: white;
                        border: none;
                        cursor: pointer;
                        border-radius: 5px;
                    }
                    button:hover {
                        background-color: #ee114f;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    table, th, td {
                        border: 1px solid #333;
                    }
                    th, td {
                        padding: 10px;
                        text-align: left;
                    }
                    th {
                        background-color: #f46892;
                    }
                </style>
            </head>
            <body>
                <h1>Employee Salary Management</h1>
                
                <form action="/create" method="POST">
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" required><br><br>
                    <label for="salary">Salary:</label>
                    <input type="text" id="salary" name="salary" required pattern="\\d+(\\.\\d{2})?"><br>
                    <button type="submit">Add</button>
                </form>

                <form action="/update" method="POST">
                    <label for="newContent">Update Content (Name|Salary):</label>
                    <input type="text" id="newContent" name="content" required><br><br>
                    <button type="submit">Update</button>
                </form>

                <form action="/delete" method="POST">
    <label for="name">Name of Employee to Delete:</label>
    <input type="text" id="name" name="name" required><br><br>
    <button type="submit">Delete</button>
</form>


                <h2>Current Content:</h2>
                <table>
                    <thead>
                        <tr>
                            <th>sr.No</th>
                            <th>Name</th>
                            <th>Salary</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </body>
            </html>
        `);
    });
});

// Route to handle creating or adding content
app.post('/create', (req, res) => {
    const { name, salary } = req.body;
    const content = `${name}|${salary}`;
    fs.appendFile(dataFilePath, content + '\n', err => {
        if (err) {
            return res.status(500).send('Error writing to file');
        }
        res.redirect('/');
    });
});


// Route to handle updating a specific entry
app.post('/update', (req, res) => {
    const { content } = req.body; // Content format: Name|NewSalary
    const [nameToUpdate, newSalary] = content.split('|');

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }

        // Split the data into lines
        const lines = data.trim().split('\n');

        // Find the index of the line that contains the name to update
        const updatedLines = lines.map(line => {
            const [name, salary] = line.split('|');
            if (name.trim() === nameToUpdate.trim()) {
                return `${name}|${newSalary}`;
            }
            return line;
        });

        // Write the updated content back to the file
        fs.writeFile(dataFilePath, updatedLines.join('\n'), err => {
            if (err) {
                return res.status(500).send('Error updating file');
            }
            res.redirect('/');
        });
    });
});


// Route to handle deleting all content
// Route to handle deleting a specific entry
app.post('/delete', (req, res) => {
    const { name } = req.body; // Name of the employee to delete

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }

        // Split the data into lines
        const lines = data.trim().split('\n');

        // Filter out the line that matches the name to delete
        const updatedLines = lines.filter(line => {
            const [entryName, salary] = line.split('|');
            return entryName.trim() !== name.trim();
        });

        // Write the updated content back to the file
        fs.writeFile(dataFilePath, updatedLines.join('\n'), err => {
            if (err) {
                return res.status(500).send('Error updating file');
            }
            res.redirect('/');
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
