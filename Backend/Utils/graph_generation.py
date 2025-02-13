import os
import json
import requests
from BuildWise.BuildWise.Backend.llm_setup import LLM
from dotenv import load_dotenv

load_dotenv()
gpt_4o_llm = LLM()

class GraphGenerator:
    def data_to_graph(self, input, llm):  
        prompt = (
        f"Analyze the following text and extract any statistical data, if it exists, in the format below:\n\n"
        f"Format Explanation:\n"
        f"[\n"
        f"    {{\n"
        f"        chart_type: (string) The type of chart to create (e.g., 'bar', 'line').\n"
        f"        labels: (list of strings) Categories or regions represented on the x-axis.\n"
        f"        data: (list of objects) Each object contains:\n"
        f"            label: (string) The name of the dataset (e.g., '2022 Sales').\n"
        f"            data: (list of numbers) The values corresponding to each label.\n"
        f"        title: (string) The title of the chart.\n"
        f"        recommended_chart: (string) A recommendation for the best chart type based on the dataset.\n"
        f"    }}\n"
        f"]\n\n"
        f"Example:\n"
        f"[\n"
        f"    {{\n"
        f"        \"chart_type\": \"bar\",\n"
        f"        \"labels\": [\"Region A\", \"Region B\", \"Region C\"],\n"
        f"        \"data\": [\n"
        f"            {{\"label\": \"2022 Sales\", \"data\": [100, 200, 300]}},\n"
        f"            {{\"label\": \"2023 Sales\", \"data\": [150, 250, 350]}}\n"
        f"        ],\n"
        f"        \"title\": \"Sales Comparison Chart\",\n"
        f"        \"recommended_chart\": \"bar\"\n"
        f"    }},\n"
        f"    {{\n"
        f"        \"chart_type\": \"line\",\n"
        f"        \"labels\": [\"January\", \"February\", \"March\"],\n"
        f"        \"data\": [\n"
        f"            {{\"label\": \"Website Traffic\", \"data\": [500, 700, 650]}},\n"
        f"            {{\"label\": \"App Traffic\", \"data\": [300, 400, 450]}}\n"
        f"        ],\n"
        f"        \"title\": \"Monthly Traffic Analysis\",\n"
        f"        \"recommended_chart\": \"line\"\n"
        f"    }}\n"
        f"]\n\n"
        f"Text:\n\n"
        f"{input}"
        "\n Ensure the response is a single JSON array containing all the charts, without extra text or explanations."
        "STRICTLY THE RESOPSE JSON ONLY {}, DON'T INCLUDE ```json```"
        )                                
        try:
            result = llm.answer(prompt)
            llm_output = result.strip()

            print(llm_output)
            # Parse the response content
            response = json.loads(llm_output)
            return self.generate_graph(response)
        except json.JSONDecodeError:
            print("json error")
            return {"error": "Invalid JSON response from LLM."}
        except Exception as e:
            print(e)
            return {"error": str(e)}

    def generate_graph(self, data):
        image_urls = []
        for chart in data:
            chart_config = {
                "type" : chart["recommended_chart"],
                "data" : {
                    "labels" : chart["labels"],
                    "datasets" : chart["data"]
                },
                "options" : {
                    "title" : {
                        "display" : True,
                        "text" : chart["title"]
                    }
                }
            }
            url = "https://quickchart.io/chart"
            response = requests.post(url, json={"chart": chart_config, "backgroundColor" : "white"})
            if response.status_code == 200:
                image_file = self._save_chart(chart["title"], response.content)
                image_urls.append(
                    {
                        "name" : chart["title"],
                        "path" : self._upload_image(image_file)
                    }
                )
            else:
                print(f"Failed to generate chart. Status code: {response.status_code}")
        return image_urls

    def _save_chart(self, title, content):
        file_name = f"images/{title}.jpg"
        with open(file_name, "wb") as file:
            file.write(content)
        print(f"Chart saved as {file_name}")
        return file_name

    def _upload_image(self, image_path):
        url = "https://freeimage.host/api/1/upload"

        with open(image_path, 'rb') as image_file:
            files = {
                'source': image_file
            }

            data = {
                'key': os.getenv("IMAGE_API"),
                'action': 'upload',
                'format': 'json'
            }

            try:
                response = requests.post(url, data=data, files=files)
                response.raise_for_status()

                result = response.json()
                if result.get('status_code') == 200:
                    return result['image']['url']
                else:
                    return f"Error: {result.get('status_txt', 'Unknown error')}"

            except requests.exceptions.RequestException as e:
                return f"An error occurred: {e}"
    