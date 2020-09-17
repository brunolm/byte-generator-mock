# byte-generator-mock

This is a temp mock project to test some stuff.

## Asking for the file size

GET `/<CID>/info`.

```bash
curl https://byte-generator-mock.herokuapp.com/10mb/info
```

## Retrieving the first chunk of data

GET `/<CID>`

```bash
curl https://byte-generator-mock.herokuapp.com/10mb --output temp
ls -lh
```

## Retrieving chunks of data with a voucher

GET `/<CID>/<VOUCHER>`

```bash
curl https://byte-generator-mock.herokuapp.com/10mb/1 --output temp
ls -lh
```
