import requests
import json

class PermitTimeFrameFetcher:
    # Class-level variables for Google API (adjust with your actual credentials)
    MY_API_KEY = "AIzaSyCqRlP1kqDSj6A3-NLhcRnrrLE_KmP8nKo"
    MY_CSE_ID = "63cb67bae11e44d04"

    def __init__(self, queries, output_file="timeframe_data.json"):
        self.queries = queries
        self.output_file = output_file

    def _google_custom_search(self, query, start=1, num_results=10):
        print(f"Fetching results {start} to {start + num_results - 1} for query: {query}")
        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            "key": self.MY_API_KEY,
            "cx": self.MY_CSE_ID,
            "q": query,
            "start": start,
            "num": num_results
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        print(data)
        print("**** Data above")
        return data.get("items", [])

    def fetch_results(self, total_results_per_query=20):
        all_results = {}
        results_per_request = 5

        for query in self.queries[:1]:
            print(f"Processing query: {query}")
            all_snippets = []
            start_index = 1

            while start_index <= total_results_per_query:
                search_results = self._google_custom_search(query, start=start_index, num_results=results_per_request)
                print(search_results)
                break
                if not search_results:
                    break
                all_snippets.extend(item.get("snippet", "") for item in search_results)
                start_index += results_per_request

            # Store the snippets for the current query
            all_results[query] = all_snippets

        # Save the results to a file
        with open(self.output_file, "w", encoding="utf-8") as f:
            json.dump(all_results, f, ensure_ascii=False, indent=4)
        print(f"Data saved to {self.output_file}")

        return all_results

# Example Usage
if __name__ == "__main__":
    queries = [
        "construction law NYC site:.gov",
        "NYC building codes and regulations",
        "NYC Department of Buildings construction permit requirements",
        "zoning laws construction NYC",
        "labor laws in construction NYC site:.gov",
        "NYC construction insurance requirements",
        "mechanic's lien laws NYC",
        "prevailing wage laws construction NYC",
        "construction defect laws NYC",
        "environmental regulations for construction NYC",
        "sustainability and green building codes NYC",
        "construction noise regulations NYC",
        "land use and zoning disputes NYC",
        "construction litigation cases NYC",
        "NYC building inspection requirements",
        "construction site safety laws NYC",
        "alternative dispute resolution construction NYC",
        "NYC construction projects government contracts",
        "ADA compliance construction NYC",
        "public bidding rules construction NYC"
    ]

    fetcher = PermitTimeFrameFetcher(queries=queries, output_file="Data/google_search_results.json")
    timeframe_data = fetcher.fetch_results(total_results_per_query=30)  # Fetch up to 30 results per query
    print("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
    print(timeframe_data)