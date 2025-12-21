# Tada

This is the classic todo list application. It will help you achieve all your dreams and goals like
magic. Thus... tada!

On the backend, it features a vanilla Express.ja application with no other frameworks or ORMs. This
was done to showcase an understanding of the backend without extra libraries and to be frank the
less overhead the quicker an application runs.

Also, the frontend uses no framework outside of React itself. While there are plenty to choose from,
such as Material UI, it's best to showcase an understanding of doing things manually as there are
valid uses cases for both using and not using a framework to do things for you. And again, the less
overhead the quicker things run in the browser.

## Notes

* Uses the React compiler for smaller bundle sizes and production performance.
* It does not yet rolldown yet as it's experimental and not yet ready for the enterprise. After
the experimental flag is removed then the Rust-based bundler should be used.
* This project leverages NPM workspaces for the sake of demonstration. In the enterprise you may
have a backend team and a separate frontend team with different release cycles. In that instance
NPM workspaces should not be used and they should be separate projects. As such, this is for
demonstration only.
* The backend uses Express.js, but perhaps one day Golang would be a consideration for migrating to
in the future.

## Node Version

The project requires at least the minimum LTS release of of Node.js, which is `24` at the time of
this writing. However, it is written against `25.2` and uses strict checks to ensure that is the
case. But, if an enterprise installation of Node only goes to LTS you can change the `engine-strict`
option to false in `.npmrc` to get around the strict check.

## Redux Tookit (RTK)

This project showcases using slices for tasks. However, it also showcases using RTK Query just for
the fun of it when it comes to using categories and users.

## Installing Certificates

The use of SSL locally is required to fully simulate a production web server, as not all things
JavaScript will perform as expected in a non-secure environment, such as service workers or the
clipboard API.

Vite has a plugin called `vite-plugin-mkcert` that automates this. However, since we are using
both client and server applications in this repository `mkcert` is used externally so that the
Express application can also leverage the certificate. To that end, you will need to install
[mkcert](https://github.com/FiloSottile/mkcert) and then run the script `cert.sh` to automate
this process.

## Installing the Database

This application uses MariaDB (MySQL) along with migrations for the backend's data store. It
leverages docker to automatically run the migrations when instianting the container. While it's
recommended, Docker isn't required should the developer choose to install MariaDB locally and
run necessary migrations.

### Using Docker

If you go the Docker route (the simplest once Docker is installed), simply use one of the commands
below.

```bash
# to use the defaults in detached mode
sudo docker compose up -d

# to change the defaults in detached mode
export MYSQL_ROOT_PASSWORD='password'
export MYSQL_DATABASE='tada'
export MYSQL_USER='user'
export MYSQL_PASSWORD='password'

sudo -E docker compose up -d

# to remove the database and volume
sudo docker compose down -v
```

### Manual Installation

You can follow [this guide](https://mariadb.com/docs/server/mariadb-quickstart-guides/installing-mariadb-server-guide)
to manually install MariaDB (MySQL). You must ensure a localhost sockets connection can be made and
that the migrations in the `containers/migrations` folder is run, however.

## Running the Application

Once the certificate and database are installed, you'll need to create a `.env` file in the `server`
folder to supply the application database credentials. Use the `.env.example` file as the basis.

Once that's done, running the application is simply a matter of:

```bash
# in the project's root directory
npm i
npm run dev
```

## Areas of Improvement

* Add a print stylesheet despite the fact they're rarely used these days.
* Add a responsive layout.
* Add CSS resets.
* Add formatting rules and/or prettier to avoid undue merge conflicts.
* Add more aria tags and semantic elements.
* Add server-side input validation so other UIs can use the API if needed.
* Add the ability to edit users.
* Add the ability to remove categories.
* Add unit and functional testing.
* Add server-side logging.
* Consider using generic types.
* Consider using the semantic dialog tag for the dialogs.
* Have SCSS variables populate CSS variables.
* Implement localization.
* Normalize styling variables.
* Remove the pixel values from CSS positioning styles.
