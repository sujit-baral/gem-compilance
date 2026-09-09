from services.ocr_extraction import extract_raw_text, extract_fields

file_path = r"uploads\APP-TD4895D-FD2067-F9D7\pancard.pdf"

print("Reading file:", file_path)
text = extract_raw_text(file_path)
print("\n--- RAW TEXT ---")
print(text)

fields = extract_fields("PAN Card", text)
print("\n--- EXTRACTED FIELDS ---")
print(fields)