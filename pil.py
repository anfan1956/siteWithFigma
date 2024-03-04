from PIL import Image
import os

cur_dir = os.getcwd()
img_dir = os.path.join(cur_dir, "images")
image_path = img_dir + '\\_M3Q9518'
print(cur_dir, ", ", img_dir, ", ", image_path)

#
# Open the JPEG image
image = Image.open(image_path+'.jpg')

# Convert the image to RGB (necessary for .webp format)
image = image.convert('RGB')

# Save the image in WebP format
image.save(image_path +'.webp', 'webp', quality=90)