# Generate thumbnails for images

import os
from PIL import Image

PUBLIC_DIRECTORY = "api/public"
THUMBNAIL_SIZE = (200, 190) # width, height

def create_directory_if_missing(path):
    if not os.path.exists(path):
        os.makedirs(path)

def generate_thumbnails(origin_path, target_path):
    files = [f for f in os.listdir(origin_path) if os.path.isfile(os.path.join(origin_path, f))]

    for file in files:
        image_path = origin_path + "/" + file
        image = Image.open(image_path)
        image.thumbnail(THUMBNAIL_SIZE)
        thumbnail_path = target_path + "/" + file
        image.save(thumbnail_path)
        print("saved ", thumbnail_path)
    

def create_photos_thumbnails_for_person(person):
    photos_path = PUBLIC_DIRECTORY + "/" + person + "/photos"
    thumbnails_path = photos_path + "/thumbnails"

    create_directory_if_missing(thumbnails_path)
    generate_thumbnails(photos_path, thumbnails_path)

def create_documents_thumbnails_for_person(person):
    photos_path = PUBLIC_DIRECTORY + "/" + person + "/documents"
    thumbnails_path = photos_path + "/thumbnails"

    create_directory_if_missing(thumbnails_path)
    generate_thumbnails(photos_path, thumbnails_path)

if __name__ == "__main__":
    for personDirectory in os.listdir(PUBLIC_DIRECTORY):
        create_photos_thumbnails_for_person(personDirectory)
        create_documents_thumbnails_for_person(personDirectory)
