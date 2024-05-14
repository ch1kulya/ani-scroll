# Infinity Anime List

Infinity Anime List is a web application that dynamically loads random anime titles from the Anilibria API. The application displays each title in a card format with details such as the Russian and English titles, year of release, genres, number of episodes, and a description. The application works similarly to TikTok or YouTube Shorts, automatically loading and displaying new titles as the user scrolls down the page.

## Features

- Displays random anime titles with their details
- Automatically loads more titles as the user scrolls
- Smooth card transitions for a seamless user experience
- Responsive design, optimized for both desktop and mobile devices

## Installation

### Prerequisites

- Python 3.x
- pip (Python package installer)

### Clone the Repository

```sh
git clone https://github.com/ch1kulya/infinity-anime-list.git
cd infinity-anime-list
```

### Install Dependencies

```sh
pip install -r requirements.txt
```

## Usage

1. Navigate to the project directory.
2. Run the Flask application.

```sh
python app.py
```

3. Open your web browser and go to `http://127.0.0.1:5000` to view the application.

## Project Structure

- `app.py`: The main Flask application file that sets up the server and API routes.
- `templates/index.html`: The main HTML file that includes the structure of the page and the script for dynamically loading content.
- `static/styles.css`: The CSS file that styles the application.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or inquiries, please contact ch1kulya on GitHub.
