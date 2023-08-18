from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in ircengg_app/__init__.py
from ircengg_app import __version__ as version

setup(
	name="ircengg_app",
	version=version,
	description="customisation",
	author="IRC Engg",
	author_email="ircengg@gmail.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
