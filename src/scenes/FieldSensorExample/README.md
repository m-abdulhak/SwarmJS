BAD: There should be some nominal location and format for a document relating to each scene.  Maybe it is Markdown file in the root of each scene's folder.

# BEEClust

Here we provide a partial implementation of the BEECLUST algorithm which was originally proposed to model the ability of young bees to congregate at the warmest point in a temperature field.  The implementation is "partial" since we don't currently have a temperature field which can be displayed and sense.  So implicitly, the temperature is the same everywhere.

(A nice informal description of the BEECLUST algorithm)[https://www.thomasschmickl.eu/complexity/beeclust]

(The first paper proposing BEECLUST)[https://link.springer.com/article/10.1007/s10458-008-9058-5]

# TBD

- Add the temperature field, including the ability to sense from it, as well as display it.

- Add avoidance behaviour when detecting the walls, and potentially other robots.
