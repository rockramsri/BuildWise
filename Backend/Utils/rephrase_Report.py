import http.server
import socketserver
import webbrowser
import os
import socket

# Define the directory where your HTML, CSS, and JS files are located
web_dir = "htmlReport"  # Update with the correct path
os.chdir(web_dir)  # Set the working directory


def find_free_port():
    """Find an available port to start the server."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("", 0))
        return s.getsockname()[1]

# question as heading, response as content, image

# [
#     {
#         "heading" : question,
#         "content" : response,
#         "images" : [{"heading" : "", "url" : ""}]
#     }
# ]

def add_sections():
    """Function to dynamically add sections to the index.html file."""
    # Read the original HTML content
    with open("index.html", "r") as file:
        html_content = file.read()

    # Find the container markers
    start_marker = '<div id="sections-container" class="sections-container">'
    end_marker = '</div>'  # Closing tag of the container

    # Check if the container exists
    if start_marker not in html_content:
        print("Error: Placeholder not found in index.html")
        return

    # Locate the indices for the container
    start_index = html_content.find(start_marker) + len(start_marker)
    end_index = html_content.find(end_marker, start_index)

    # Collect new sections content
    new_sections = ""

    print("Enter sections to add to the webpage (type 'done' to finish):\n")
    while True:
        section_type = input("Enter section type (text/image) or 'done': ").strip().lower()
        if section_type == "done":
            break

        heading = input("Enter heading: ").strip()
        if section_type == "text":
            content = input("Enter content: ").strip()
            new_sections += f"""
                <div class="section">
                    <h2>{heading}</h2>
                    <p>{content}</p>
                </div>
            """
        elif section_type == "image":
            image_url = input("Enter image URL: ").strip()
            new_sections += f"""
                <div class="section">
                    <h2>{heading}</h2>
                    <img src="{image_url}" alt="{heading}" style="max-width: 100%; border-radius: 8px;">
                </div>
            """
        else:
            print("Invalid section type. Please enter 'text' or 'image'.")

    # Replace the container content with the new sections
    updated_html = (
            html_content[:start_index]  # Content before the container
            + new_sections  # New sections
            + html_content[end_index:]  # Content after the container
    )

    # Write back the updated HTML
    with open("index.html", "w") as file:
        file.write(updated_html)
    print("Updated HTML content has been written and old content overridden.")


def start_server():
    """Function to start the server and open the webpage."""
    PORT = find_free_port()  # Find an available port

    Handler = http.server.SimpleHTTPRequestHandler

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        webbrowser.open(f"http://localhost:{PORT}/index.html")  # Open the page in the default browser
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("Server stopped.")
            httpd.shutdown()


# Main script
if __name__ == "__main__":
    # Step 1: Update the HTML content
    add_sections()

    # Step 2: Start the server
    start_server()