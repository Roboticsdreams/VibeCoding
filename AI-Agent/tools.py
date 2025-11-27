from datetime import datetime
import os
import re

def save_to_txt(data: str, filename: str = "research_output.txt"):
    # Ensure the filename is sanitized (remove path separators and limit to alphanumeric chars, underscores, and hyphens)
    safe_filename = re.sub(r'[^\w.-]', '_', os.path.basename(filename))
    
    # Define a specific output directory
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "outputs")
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Create safe path with sanitized filename
    safe_path = os.path.join(output_dir, safe_filename)
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted_text = f"--- Research Output ---\nTimestamp: {timestamp}\n\n{data}\n\n"

    with open(safe_path, "a", encoding="utf-8") as f:
        f.write(formatted_text)
    
    return f"Data successfully saved to {safe_path}"

# No need for tool definitions in the simplified version
