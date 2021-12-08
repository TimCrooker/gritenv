# <%= name %>

> <%= description %>

## Usage

Install [Grit](https://github.com/TimCrooker/projenerator) first.

```bash
yarn global add grit-cli
# or
npm i -g grit-cli
```

### From npm

```bash
grit <%= name.replace('grit-', '') %> my-project
```

### From git

```bash
grit <%= username %>/<%= name %> my-project
```

## License

MIT [<%= username %>](<%= website %>)
