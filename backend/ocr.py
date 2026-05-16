from paddleocr import PaddleOCR
import re
from typing import Optional, Dict, Any
from PIL import Image
import io

ocr = PaddleOCR(use_angle_cls=True, lang='en')

def extract_aadhaar_info(image_data: bytes) -> Dict[str, Any]:
    """Extract Aadhaar information from an image using PaddleOCR."""
    try:
        image = Image.open(io.BytesIO(image_data))
        result = ocr.ocr(image, cls=True)
        
        raw_lines = []
        for line in result:
            if line:
                for word_info in line:
                    text = word_info[1]
                    raw_lines.append(text)
        
        raw_text = '\n'.join(raw_lines)
        
        aadhaar_match = re.search(r'\b\d{4}\s\d{4}\s\d{4}\b|\b\d{12}\b', raw_text)
        aadhaar_number = None
        if aadhaar_match:
            aadhaar_number = aadhaar_match.group(0).replace(' ', '')
        
        dob_match = re.search(r'\b(\d{2})[/-](\d{2})[/-](\d{4})\b', raw_text)
        dob = None
        if dob_match:
            dob = f"{dob_match.group(1)}/{dob_match.group(2)}/{dob_match.group(3)}"
        
        pin_match = re.search(r'\b\d{6}\b', raw_text)
        address = None
        if pin_match:
            for line in raw_lines:
                if pin_match.group(0) in line:
                    address = line
                    break
        
        name = None
        for line in raw_lines:
            clean_line = line.strip()
            if len(clean_line) >= 3:
                alpha_count = sum(1 for c in clean_line if c.isalpha() or c.isspace())
                if alpha_count / len(clean_line) > 0.7:
                    name = clean_line
                    break
        
        return {
            'name': name,
            'dob': dob,
            'aadhaarNumber': aadhaar_number,
            'address': address,
            'rawText': raw_text
        }
    
    except Exception as e:
        return {
            'name': None,
            'dob': None,
            'aadhaarNumber': None,
            'address': None,
            'rawText': f"Error during OCR: {str(e)}"
        }
