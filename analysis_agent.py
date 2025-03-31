import json
from typing import Dict, Any

class AnalysisAgent:
    def __init__(self):
        """Initialize the Analysis Agent."""
        pass
        
    def load_data(self, json_file_path: str) -> Dict[str, Any]:
        """
        Load and parse the JSON data file.
        
        Args:
            json_file_path: Path to the JSON file with extracted code data
            
        Returns:
            Parsed JSON data as a dictionary
        """
        try:
            with open(json_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return data
        except Exception as e:
            raise Exception(f"Error loading JSON file: {str(e)}")
    
    def generate_prompt(self, extracted_data: Dict[str, Any], user_query: str) -> str:
        """
        Generate a prompt based on extracted data and user query.
        
        Args:
            extracted_data: The parsed JSON data containing code information
            user_query: The user's query or information request
            
        Returns:
            A formatted prompt string
        """
        file_count = len(extracted_data.get("files", []))
        function_count = sum(len(file.get("functions", [])) for file in extracted_data.get("files", []))
        
        prompt = f"""
You are a code analysis assistant working with the following codebase:
- {file_count} files analyzed
- Approximately {function_count} functions/methods identified

The user wants to know: {user_query}

Based on the extracted code information below, provide a concise and accurate response:

```
{json.dumps(extracted_data, indent=2)[:1000]}... (truncated for brevity)
```

Focus on being factual and precise. If the information cannot be determined from the provided code extraction, state that clearly.
"""
        return prompt
    
    def query_mistral(self, prompt: str) -> str:
        """
        Send the generated prompt to the local Mistral LLM and get the response.
        
        Args:
            prompt: The formatted prompt to send to the model
            
        Returns:
            The model's response text
        """
        return "Please connect with LLM to get actual analysis results."
    
    def analyze(self, json_file_path: str, user_query: str) -> str:
        """
        Main method to run the analysis pipeline.
        
        Args:
            json_file_path: Path to the JSON file with extracted code data
            user_query: The user's query about the codebase
            
        Returns:
            The final analysis from the LLM
        """
        try:
            # Step 1: Load the JSON data
            extracted_data = self.load_data(json_file_path)
            
            # Step 2: Generate the prompt using the data and query
            prompt = self.generate_prompt(extracted_data, user_query)
            
            # Step 3: Get response from LLM (currently mocked)
            response = self.query_mistral(prompt)
            
            return response
            
        except Exception as e:
            return f"Error during analysis: {str(e)}"

def main():
    # Hardcoded file path and query
    json_file_path = "sample_extracted_data.json"
    user_query = "What are the main functions in the codebase?"
    
    agent = AnalysisAgent()
    result = agent.analyze(json_file_path, user_query)
    
    print("\n--- ANALYSIS RESULT ---\n")
    print(result)

if __name__ == "__main__":
    main() 