//dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Joi = require('joi');
const neo4j = require('neo4j-driver');
const UUID = require('uuid-int');
const jwt = require('jsonwebtoken');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

//express setup
const app = express();

app.use(express.json());

//allow cors
app.use(cors());

//connect to neo4j db and start a session
const driver = neo4j.driver("bolt://localhost:7687/PoliticlearDB", neo4j.auth.basic('neo4j', 'ei22068'));

//initialize random id generator
const uuidGen = UUID(0);

//swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi:'3.0.0',
        info: {
            title: "Politiclear API",
            description: "Politiclear API Information",
            contact: {
                name: "Leonardo Franco"
            },
            servers: ["http://localhost:3000"]
        }
    },

    apis: ["app.js"]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//routes

/**
 * @swagger
 * components:
 *  securitySchemes:
 *      bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 */
    
/**
 * @swagger
 * 
 * /api/CidadaoRegistado/registar:
 *      post:
 *          description: Registar um novo cidadão registado.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              nome:
 *                                  type: string
 *                                  required: true
 *                                  example: "Tiago Rocha"
 *                              username:
 *                                  type: string
 *                                  required: true
 *                                  example: "trocha22222"
 *                              password:
 *                                  type: string
 *                                  required: true
 *                                  example: "passteste"
 *                              nCC:
 *                                  type: integer
 *                                  required: true
 *                                  example: 8127364
 *          responses:
 *              '201':
 *                  description: Um novo cidadão registado foi registado com sucesso. Devolve a informação do novo cidadão registado.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 *                      
 */
app.post("/api/CidadaoRegistado/registar", (req, res) =>{

    var session = driver.session();

    const result = validateRegister(req.body);
    if(result.error) return res.status(400).send(result.error);

    session.run(`MATCH (n) WHERE n.username = '${req.body.username}' OR n.nCC = ${req.body.nCC} RETURN n`)
        .then((result) => {
            if(result.records.length > 0){
                res.status(400).send("Já existe um utilizador com esse username ou cartão de cidadão.");
            } else {
                const idGrande = uuidGen.uuid();
                const id = idGrande % 10000000;
                var insertedNode = {};

                var trans = session.beginTransaction();

                trans.run(`CREATE (u:CidadaoRegistado {id: ${id}, username: '${req.body.username}', password: '${req.body.password}', nome: '${req.body.nome}', nCC: ${req.body.nCC}, ativo: true}) RETURN u`)
                    .then((result) => {
                        insertedNode = {id: id, type: `${req.params.tipoUser}`, username: `${req.body.username}`, password: `${req.body.password}`, nome: `${req.body.nome}`, nCC: req.body.nCC};
                        res.status(201).send(insertedNode);
                        trans.commit();
                    })
                    .catch((error) => {
                        console.log(error);
                        res.status(400).send("Algo correu mal com a query.");
                        trans.rollback();
                    });
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(400).send("Algo correu mal com a query.");
        });
});

/**
 * @swagger
 * 
 * /api/Politico/registar:
 *      post:
 *          description: Registar um novo político. Possível quando logged in como administrador.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              nome:
 *                                  type: string
 *                                  required: true
 *                                  example: "Tiago Rocha"
 *                              username:
 *                                  type: string
 *                                  required: true
 *                                  example: "trocha22222"
 *                              password:
 *                                  type: string
 *                                  required: true
 *                                  example: "passteste"
 *                              nCC:
 *                                  type: integer
 *                                  required: true
 *                                  example: 8127364
 *                              habilitacoes:
 *                                  type: integer
 *                                  required: true
 *                                  example: "Licenciatura"
 *                              circuloEleitoral:
 *                                  type: integer
 *                                  required: true
 *                                  example: "Sul"
 *                              partido:
 *                                  type: integer
 *                                  required: true
 *                                  example: 1
 *          responses:
 *              '201':
 *                  description: Um novo político foi registado com sucesso. Devolve a informação do novo político.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para criar uma conta do tipo Político ou o token de acesso está fora de validade.
 *                      
 */
app.post("/api/Politico/registar", (req, res) =>{

    var session = driver.session();

    const result = validateRegisterPolitico(req.body);
    if(result.error) return res.status(400).send(result.error);

    user = validateToken(req, res);
    
    var trans;

    var insertedNode = {};

    var pesquisa = async () =>{
        await session.run(`MATCH (n) WHERE n.username = '${req.body.username}' OR n.nCC = ${req.body.nCC} RETURN n`)
            .then(async (result) => {
                if(result.records.length > 0){
                    res.status(400).send("Já existe um utilizador com esse username ou cartão de cidadão.");
                } else {
                    const idGrande = uuidGen.uuid();
                    const id = idGrande % 10000000;

                    trans = session.beginTransaction();

                    await trans.run(`MATCH (o:Organizacao) WHERE o.id = ${req.body.partido} AND o.tipo = 'Partido' CREATE (u:Politico {id: ${id}, username: '${req.body.username}', password: '${req.body.password}', nome: '${req.body.nome}', nCC: ${req.body.nCC}, habilitacoes: '${req.body.habilitacoes}', circuloEleitoral: '${req.body.circuloEleitoral}', ativo: true}) CREATE (u)-[:PERTENCE_A]->(o) RETURN o, u`)
                        .then((result) => {
                            if(result.records.length == 0){
                                res.status(404).send("Partido não encontrado.");
                                trans.rollback();
                            } else {
                                insertedNode.id = id;
                                insertedNode.username = `${req.body.username}`;
                                insertedNode.password = `${req.body.password}`;
                                insertedNode.nome = `${req.body.nome}`;
                                insertedNode.nCC = req.body.nCC;
                                insertedNode.habilitacoes = `${req.body.habilitacoes}`;
                                insertedNode.circuloEleitoral = `${req.body.circuloEleitoral}`;
                                insertedNode.partido = req.body.partido;
                                trans.commit();    
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        });
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            });    
    }

    if(user && user.tipo == 'Administrador'){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, insertedNode).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    res.status(201).send(insertedNode);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

/**
 * @swagger
 * 
 * /api/{tipoUser}/registar:
 *      post:
 *          description: Registar um novo utilizador. Possível quando logged in como administrador.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: path
 *                name: tipoUser
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              nome:
 *                                  type: string
 *                                  required: true
 *                                  example: "Tiago Rocha"
 *                              username:
 *                                  type: string
 *                                  required: true
 *                                  example: "trocha22222"
 *                              password:
 *                                  type: string
 *                                  required: true
 *                                  example: "passteste"
 *                              nCC:
 *                                  type: integer
 *                                  required: true
 *                                  example: 8127364
 *          responses:
 *              '201':
 *                  description: Um novo utilizador foi registado com sucesso. Devolve a informação do novo utilizador.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para criar uma conta do tipo especificado ou o token de acesso está fora de validade.
 *                      
 */
app.post("/api/:tipoUser/registar", (req, res) =>{

    var session = driver.session();

    const result = validateRegister(req.body);
    if(result.error) return res.status(400).send(result.error);

    user = validateToken(req, res);

    var trans;
    
    var insertedNode = {};

    var pesquisa = async () =>{

        await session.run(`MATCH (n) WHERE n.username = '${req.body.username}' OR n.CC = ${req.body.nCC} RETURN n`)
            .then(async (result) => {
                if(result.records.length > 0){
                    res.status(400).send("Já existe um utilizador com esse username ou cartão de cidadão.");
                } else {
                    const idGrande = uuidGen.uuid();
                    const id = idGrande % 10000000;

                    trans = session.beginTransaction();

                    await trans.run(`CREATE (u:${req.params.tipoUser} {id: ${id}, username: '${req.body.username}', password: '${req.body.password}', nome: '${req.body.nome}', nCC: ${req.body.nCC}, ativo: true}) RETURN u`)
                        .then((result) => {
                            insertedNode.id = id;
                            insertedNode.type = `${req.params.tipoUser}`;
                            insertedNode.username = `${req.body.username}`;
                            insertedNode.password = `${req.body.password}`;
                            insertedNode.nome = `${req.body.nome}`;
                            insertedNode.nCC = req.body.nCC;
                            trans.commit();
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        });
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            });    
    }

    if(user && user.tipo == 'Administrador'){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, insertedNode).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    res.status(201).send(insertedNode);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

/**
 * @swagger
 * 
 * /api/login:
 *      post:
 *          description: Efetuar login.
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              username:
 *                                  type: string
 *                                  required: true
 *                                  example: "trocha22222"
 *                              password:
 *                                  type: string
 *                                  required: true
 *                                  example: "passteste"
 *          responses:
 *              '200':
 *                  description: Login efetuado com sucesso. Devolve access e refresh tokens.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Credenciais de login inválidas ou utilizador está inativo.  
 */
app.post("/api/login", (req, res) =>{

    var session = driver.session();

    const result = validateLogin(req.body);
    if(result.error) return res.status(400).send(result.error);

    var matchedNode = {};

    session.run(`MATCH (u) WHERE u.username = '${req.body.username}' AND u.password = '${req.body.password}' RETURN u`)
        .then((result) => {
            if(result.records.length == 0){
                res.status(401).send("Username/password inválido.");
            } else {
                if(result.records[0]._fields[0].properties.ativo){
                    matchedNode = {id: result.records[0]._fields[0].properties.id.low, tipo: result.records[0]._fields[0].labels[0], username: `${req.body.username}`, nome: result.records[0]._fields[0].properties.nome};
                    var tokens = generateTokens(matchedNode, res);
                    if(!res.writableEnded){
                        res.status(200).send({info: matchedNode, tokens: tokens});    
                    }    
                } else {
                    res.status(401).send("O utilizador está inativo.");
                }
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(400).send("Algo correu mal com a query.");
        });
});

/**
 * @swagger
 * 
 * /api/logout:
 *      delete:
 *          description: Efetuar logout quando logged in como qualquer tipo de utilizador.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 * 
 *          responses:
 *              '201':
 *                  description: Logout efetuado com sucesso.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta.
 *              
 *              '403':
 *                  description: O token de acesso está fora de validade.
 *                      
 */
app.delete("/api/logout", (req, res) => {
    
    deleteToken(req.headers.refreshtoken, res);   
});

/**
 * @swagger
 * 
 * /api/profile/Politico/{id}:  
 *      get:
 *          description: Obter todas as informações de um político. Possível quando logged in como esse político or como um administrador.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: path
 *                name: id
 * 
 *          responses:
 *              '200':
 *                  description: Informações do utilizador obtidas com sucesso. Devolve informações do utilizador.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para visualizar as informações deste utilizador ou o token de acesso está fora de validade.
 *         
 *      put:
 *          description: Atualizar informação de um político. Possível quando logged in como um administrador.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: path
 *                name: id
 * 
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              nome:
 *                                  type: string
 *                                  example: "Tiago Rocha Passos"
 *                              username:
 *                                  type: string
 *                                  example: "trocha33333"
 *                              password:
 *                                  type: string
 *                                  example: "passteste22"
 *                              nCC:
 *                                  type: integer
 *                                  example: 8127364
 *                              habilitacoes:
 *                                  type: string
 *                                  example: "Mestrado"
 *                              partido:
 *                                  type: integer
 *                                  example: 1
 * 
 *          responses:
 *              '200':
 *                  description: Informações do utilizador alteradas com sucesso. Devolve novas informações do utilizador.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para alterar as informações deste utilizador ou o token de acesso está fora de validade.
 *               
 *              '404':
 *                  description: Utilizador não encontrado.
 */
app.get("/api/profile/Politico/:id", (req, res) => {

    var session = driver.session();

    var matchedNode = {user: {}, partido: {}, registos: {votados: [], acerca: []}, organizacoes: [], eventos: {organizados: [], participados: []}, concursos: {organizados: [], participados: [], vencidos: []}, contratos: {propostos: [], assinados: []}};

    user = validateToken(req, res);
    
    var pesquisa = async (user) => {

        await session.run(`MATCH (u:Politico) WHERE u.id = ${req.params.id} RETURN u`)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Utilizador não encontrado.");
                    trans.rollback();
                } else {
                    matchedNode.user = {id: req.params.id, tipoUser: "Politico", nome: result.records[0]._fields[0].properties.nome, username: result.records[0]._fields[0].properties.username, nCC: result.records[0]._fields[0].properties.nCC.low, habilitacoes: result.records[0]._fields[0].properties.habilitacoes, circuloEleitoral: result.records[0]._fields[0].properties.circuloEleitoral};
                    await session.run(`MATCH (u:Politico)-[:PERTENCE_A]->(o:Organizacao) WHERE u.id = ${req.params.id} AND o.tipo = 'Partido' RETURN o`)
                        .then((result) => {
                            matchedNode.partido = {id: result.records[0]._fields[0].properties.id.low, nome: `${result.records[0]._fields[0].properties.nome}`};
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                    
                    await session.run(`MATCH (u:Politico)-[:PERTENCE_A]->(o:Organizacao) WHERE u.id = ${req.params.id} RETURN o`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.organizacoes.push({id: record._fields[0].properties.id.low, nome: `${record._fields[0].properties.nome}`});
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (u:Politico)-[:ORGANIZA]->(c:Concurso) WHERE u.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.organizados.push({id: record._fields[0].properties.id.low, nome: `${record._fields[0].properties.nome}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (u:Politico)-[:PARTICIPA_EM]->(c:Concurso) WHERE u.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.participados.push({id: record._fields[0].properties.id.low, nome: `${record._fields[0].properties.nome}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (u:Politico)-[:VENCE]->(c:Concurso) WHERE u.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.vencidos.push({id: record._fields[0].properties.id.low, nome: `${record._fields[0].properties.nome}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (u:Politico)-[:PROPOE]->(c:Contrato) WHERE u.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.contratos.propostos.push({id: record._fields[0].properties.id.low, nome: `${record._fields[0].properties.nome}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (u:Politico)-[:ASSINA]->(c:Contrato) WHERE u.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.contratos.assinados.push({id: record._fields[0].properties.id.low, nome: `${record._fields[0].properties.nome}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                    
                    await session.run(`MATCH (u:Politico)-[:ORGANIZA]->(e:Evento) WHERE u.id = ${req.params.id} RETURN e`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.eventos.organizados.push({id: record._fields[0].properties.id.low, nome: `${record._fields[0].properties.nome}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                    
                    await session.run(`MATCH (u:Politico)-[:PARTICIPA_EM]->(e:Evento) WHERE u.id = ${req.params.id} RETURN e`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.eventos.participados.push({id: record._fields[0].properties.id.low, nome: `${record._fields[0].properties.nome}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                    
                    await session.run(`MATCH (u:Politico)-[:VOTA_EM]->(r:Registo) WHERE u.id = ${req.params.id} RETURN r`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.registos.votados.push({id: record._fields[0].properties.id.low, titulo: `${record._fields[0].properties.titulo}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                        
                    await session.run(`MATCH (u:Politico)<-[:ACERCA_DE]-(r:Registo) WHERE u.id = ${req.params.id} RETURN r`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.registos.acerca.push({id: record._fields[0].properties.id.low, titulo: `${record._fields[0].properties.titulo}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })
    }

    if(user && (user.tipo == 'Administrador' || (user.id == req.params.id && user.tipo == "Politico"))){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, matchedNode).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    res.status(200).send(matchedNode);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

app.put("/api/profile/Politico/:id", (req, res) => {

    var session = driver.session();

    const result = validateAlterarPolitico(req.body);
    if(result.error) return res.status(400).send(result.error);

    user = validateToken(req, res);

    var updatedNode = {};

    var statement = `MATCH (u:Politico) WHERE u.id = ${req.params.id} `;

    if(req.body.nome){
        statement = statement + `SET u.nome = '${req.body.nome}' `;
    }
    if(req.body.username){
        if(statement.includes("SET")){
            statement = statement + `, u.username = '${req.body.username}' `;
        } else {
            statement = statement + `SET u.username = '${req.body.username}' `;
        }
    }
    if(req.body.password){
        if(statement.includes("SET")){
            statement = statement + `, u.password = '${req.body.password}' `;
        } else {
            statement = statement + `SET u.password = '${req.body.password}' `;
        }
    }
    if(req.body.nCC){
        if(statement.includes("SET")){
            statement = statement + `, u.nCC = ${req.body.nCC} `;
        } else {
            statement = statement + `SET u.nCC = ${req.body.nCC} `;
        }
    }
    if(req.body.habilitacoes){
        if(statement.includes("SET")){
            statement = statement + `, u.habilitacoes = '${req.body.habilitacoes}' `;
        } else {
            statement = statement + `SET u.habilitacoes = '${req.body.habilitacoes}' `;
        }
    }
    if(req.body.circuloEleitoral){
        if(statement.includes("SET")){
            statement = statement + `, u.circuloEleitoral = '${req.body.circuloEleitoral}' `;
        } else {
            statement = statement + `SET u.circuloEleitoral = '${req.body.circuloEleitoral}' `;
        }
    }

    statement = statement + "RETURN u";

    if(req.body.username || req.body.nCC){
        var statement2;
        var errorMessage;

        if(req.body.username && !req.body.nCC){
            statement2 = `MATCH (n) WHERE n.username = '${req.body.username}' RETURN n`;
            errorMessage = "Já existe um utilizador com esse username.";
        } else if(!req.body.username && req.body.nCC){
            statement2 = `MATCH (n) WHERE n.nCC = ${req.body.nCC} RETURN n`;
            errorMessage = "Já existe um utilizador com esse cartão de cidadão.";
        } else if(req.body.username && req.body.nCC){
            statement2 = `MATCH (n) WHERE n.username = '${req.body.username}' OR n.nCC = ${req.body.nCC} RETURN n`;
            errorMessage = "Já existe um utilizador com esse username ou cartão de cidadão.";
        }
    }

    var trans;

    var pesquisa = async (statement) => {

        trans = session.beginTransaction();

        await trans.run(`MATCH (n:Politico) WHERE n.id = ${req.params.id} RETURN n`)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Utilizador não encontrado.");
                    trans.rollback();
                } else {
                    if(req.body.username || req.body.nCC){
                        await trans.run(statement2)
                            .then(async (result) => {
                                if(result.records.length > 0){
                                    res.status(401).send(errorMessage);
                                    trans.rollback();
                                } else {
                                    await trans.run(statement)
                                        .then((result) => {
                                            updatedNode.id = req.params.id;
                                            updatedNode.nome = `${result.records[0]._fields[0].properties.nome}`;
                                            updatedNode.username = `${result.records[0]._fields[0].properties.username}`;
                                            updatedNode.password = `${result.records[0]._fields[0].properties.password}`;
                                            updatedNode.nCC = result.records[0]._fields[0].properties.nCC;
                                            updatedNode.tipo = result.records[0]._fields[0].labels[0];
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                            res.status(400).send("Algo correu mal com a query.");
                                            trans.rollback();
                                        });
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                                res.status(400).send("Algo correu mal com a query.");
                                trans.rollback();
                            })
                    } else {
                        await trans.run(statement)
                            .then((result) => {
                                updatedNode.id = req.params.id;
                                updatedNode.nome = `${result.records[0]._fields[0].properties.nome}`;
                                updatedNode.username = `${result.records[0]._fields[0].properties.username}`;
                                updatedNode.password = `${result.records[0]._fields[0].properties.password}`;
                                updatedNode.nCC = result.records[0]._fields[0].properties.nCC;
                                updatedNode.tipo = result.records[0]._fields[0].labels[0];
                            })
                            .catch((error) => {
                                console.log(error);
                                res.status(400).send("Algo correu mal com a query.");
                                trans.rollback();
                            });       
                    }
                    if(req.body.partido){
                        await trans.run(`MATCH (p:Politico)-[r:PERTENCE_A]->(o:Organizacao) WHERE p.id = ${req.params.id} AND o.tipo = 'Partido' MATCH (no:Organizacao) WHERE no.id = ${req.body.partido} AND no.tipo = 'Partido' DELETE r CREATE (p)-[:PERTENCE_A]->(no) RETURN no`)
                            .then((result) => {
                                updatedNode.partido = req.body.partido;
                            })
                            .catch((error) => {
                                console.log(error);
                                res.status(400).send("Algo correu mal com a query.");
                                trans.rollback();
                            })
                    }
                }
            })
    }
   
    if(user && (user.tipo == 'Administrador' || (user.id == req.params.id && user.tipo == "Politico"))){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, updatedNode).then(() => {
            pesquisa(statement).then(() => {
                if(!res.writableEnded){
                    updatedNode.tokens = generateTokens({id: updatedNode.id, tipo: updatedNode.tipo, username: updatedNode.username, nome: updatedNode.nome}, res);
                    trans.commit();
                    res.send(updatedNode);
                }
            })
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

/**
 * @swagger
 * 
 * /api/profile/{tipoUser}/{id}:
 *      get:
 *          description: Obter todas as informações de um utilizador. Possível quando logged in como esse utilizador or como um administrador.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: path
 *                name: tipoUser
 *              - in: path
 *                name: id
 * 
 *          responses:
 *              '200':
 *                  description: Informações do utilizador obtidas com sucesso. Devolve informações do utilizador.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para visualizar as informações deste utilizador ou o token de acesso está fora de validade.
 *               
 *      put:
 *          description: Atualizar informação de um utilizador. Possível quando logged in como esse utilizador (caso o utilizador seja um cidadão registado) ou como um administrador, para os restantes casos.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: path
 *                name: tipoUser
 *              - in: path
 *                name: id
 * 
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              nome:
 *                                  type: string
 *                                  example: "Tiago Rocha Passos"
 *                              username:
 *                                  type: string
 *                                  example: "trocha33333"
 *                              password:
 *                                  type: string
 *                                  example: "passteste22"
 *                              nCC:
 *                                  type: integer
 *                                  example: 8127364
 * 
 *          responses:
 *              '200':
 *                  description: Informações do utilizador alteradas com sucesso. Devolve novas informações do utilizador.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para alterar as informações deste utilizador ou o token de acesso está fora de validade.
 *               
 *              '404':
 *                  description: Utilizador não encontrado.
 */
app.get("/api/profile/:tipoUser/:id", (req, res) => {

    var session = driver.session();

    var matchedNode = {user: {}, registos: {criados: [], votados: [], acerca: []}, organizacoes: [], eventos: {organizados: [], participados: []}, concursos: {organizados: [], participados: [], vencidos: []}, contratos: {propostos: [], assinados: []}};

    user = validateToken(req, res);
    
    var pesquisa = async (user) => {

        await session.run(`MATCH (u:${req.params.tipoUser}) WHERE u.id = ${req.params.id} RETURN u`)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Utilizador não encontrado.");
                    trans.rollback();
                } else {
                    matchedNode.user = {id: req.params.id, tipoUser: req.params.tipoUser, nome: result.records[0]._fields[0].properties.nome, username: result.records[0]._fields[0].properties.username, nCC: result.records[0]._fields[0].properties.nCC.low};
                    await session.run(`MATCH (u:${req.params.tipoUser})-[:PERTENCE_A]->(o:Organizacao) WHERE u.id = ${req.params.id} RETURN o`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.organizacoes.push({id: record._fields[0].properties.id.low, nome: `${record._fields[0].properties.nome}`});
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (u:${req.params.tipoUser})-[:ORGANIZA]->(c:Concurso) WHERE u.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.organizados.push({id: record._fields[0].properties.id.low, nome: `${record._fields[0].properties.nome}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (u:${req.params.tipoUser})-[:PARTICIPA_EM]->(c:Concurso) WHERE u.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.participados.push({id: record._fields[0].properties.id.low, nome: `${record._fields[0].properties.nome}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (u:${req.params.tipoUser})-[:VENCE]->(c:Concurso) WHERE u.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.vencidos.push({id: record._fields[0].properties.id.low, nome: `${record._fields[0].properties.nome}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (u:${req.params.tipoUser})-[:PROPOE]->(c:Contrato) WHERE u.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.contratos.propostos.push({id: record._fields[0].properties.id.low, nome: `${record._fields[0].properties.nome}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (u:${req.params.tipoUser})-[:ASSINA]->(c:Contrato) WHERE u.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.contratos.assinados.push({id: record._fields[0].properties.id.low, nome: `${record._fields[0].properties.nome}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                    
                    await session.run(`MATCH (u:${req.params.tipoUser})-[:ORGANIZA]->(e:Evento) WHERE u.id = ${req.params.id} RETURN e`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.eventos.organizados.push({id: record._fields[0].properties.id.low, nome: `${record._fields[0].properties.nome}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                    
                    await session.run(`MATCH (u:${req.params.tipoUser})-[:PARTICIPA_EM]->(e:Evento) WHERE u.id = ${req.params.id} RETURN e`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.eventos.participados.push({id: record._fields[0].properties.id.low, nome: `${record._fields[0].properties.nome}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                    
                    await session.run(`MATCH (u:${req.params.tipoUser})-[:CRIA]->(r:Registo) WHERE u.id = ${req.params.id} RETURN r`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.registos.criados.push({id: record._fields[0].properties.id.low, titulo: `${record._fields[0].properties.titulo}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                    
                    await session.run(`MATCH (u:${req.params.tipoUser})-[:VOTA_EM]->(r:Registo) WHERE u.id = ${req.params.id} RETURN r`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.registos.votados.push({id: record._fields[0].properties.id.low, titulo: `${record._fields[0].properties.titulo}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                        
                    await session.run(`MATCH (u:${req.params.tipoUser})<-[:ACERCA_DE]-(r:Registo) WHERE u.id = ${req.params.id} RETURN r`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.registos.acerca.push({id: record._fields[0].properties.id.low, titulo: `${record._fields[0].properties.titulo}` });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })
    }

    if(user && (user.tipo == 'Administrador' || (user.id == req.params.id && user.tipo == req.params.tipoUser))){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, matchedNode).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    res.status(200).send(matchedNode);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});
     
app.put("/api/profile/:tipoUser/:id", (req, res) => {
    
    var session = driver.session();

    const result = validateAlterarUser(req.body);
    if(result.error) return res.status(400).send(result.error);

    user = validateToken(req, res);

    var updatedNode = {};

    var statement = `MATCH (u:${req.params.tipoUser}) WHERE u.id = ${req.params.id} `;

    if(req.body.nome){
        statement = statement + `SET u.nome = '${req.body.nome}' `;
    }
    if(req.body.username){
        if(statement.includes("SET")){
            statement = statement + `, u.username = '${req.body.username}' `;
        } else {
            statement = statement + `SET u.username = '${req.body.username}' `;
        }
    }
    if(req.body.password){
        if(statement.includes("SET")){
            statement = statement + `, u.password = '${req.body.password}' `;
        } else {
            statement = statement + `SET u.password = '${req.body.password}' `;
        }
    }
    if(req.body.nCC){
        if(statement.includes("SET")){
            statement = statement + `, u.nCC = ${req.body.nCC} `;
        } else {
            statement = statement + `SET u.nCC = ${req.body.nCC} `;
        }
    }

    statement = statement + "RETURN u";

    if(req.body.username || req.body.nCC){
        var statement2;
        var errorMessage;

        if(req.body.username && !req.body.nCC){
            statement2 = `MATCH (n) WHERE n.username = '${req.body.username}' RETURN n`;
            errorMessage = "Já existe um utilizador com esse username.";
        } else if(!req.body.username && req.body.nCC){
            statement2 = `MATCH (n) WHERE n.nCC = ${req.body.nCC} RETURN n`;
            errorMessage = "Já existe um utilizador com esse cartão de cidadão.";
        } else if(req.body.username && req.body.nCC){
            statement2 = `MATCH (n) WHERE n.username = '${req.body.username}' OR n.nCC = ${req.body.nCC} RETURN n`;
            errorMessage = "Já existe um utilizador com esse username ou cartão de cidadão.";
        }
    }

    var trans;

    var pesquisa = async (statement) => {

        trans = session.beginTransaction();

        await trans.run(`MATCH (n:${req.params.tipoUser}) WHERE n.id = ${req.params.id} RETURN n`)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Utilizador não encontrado.");
                    trans.rollback();
                } else {
                    if(req.body.username || req.body.nCC){
                        await trans.run(statement2)
                            .then(async (result) => {
                                if(result.records.length > 0){
                                    res.status(401).send(errorMessage);
                                    trans.rollback();
                                } else {
                                    await trans.run(statement)
                                        .then((result) => {
                                            updatedNode.id = req.params.id;
                                            updatedNode.nome = `${result.records[0]._fields[0].properties.nome}`;
                                            updatedNode.username = `${result.records[0]._fields[0].properties.username}`;
                                            updatedNode.password = `${result.records[0]._fields[0].properties.password}`;
                                            updatedNode.nCC = result.records[0]._fields[0].properties.nCC;
                                            updatedNode.tipo = result.records[0]._fields[0].labels[0];
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                            res.status(400).send("Algo correu mal com a query.");
                                            trans.rollback();
                                        });
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                                res.status(400).send("Algo correu mal com a query.");
                                trans.rollback();
                            })
                    } else {
                        await trans.run(statement)
                            .then((result) => {
                                updatedNode.id = req.params.id;
                                updatedNode.nome = `${result.records[0]._fields[0].properties.nome}`;
                                updatedNode.username = `${result.records[0]._fields[0].properties.username}`;
                                updatedNode.password = `${result.records[0]._fields[0].properties.password}`;
                                updatedNode.nCC = result.records[0]._fields[0].properties.nCC;
                                updatedNode.tipo = result.records[0]._fields[0].labels[0];
                            })
                            .catch((error) => {
                                console.log(error);
                                res.status(400).send("Algo correu mal com a query.");
                                trans.rollback();
                            });       
                    }
                }
            })
    }
   
    if(user && (user.tipo == 'Administrador' || (user.id == req.params.id && user.tipo == req.params.tipoUser))){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, updatedNode).then(() => {
            pesquisa(statement).then(() => {
                if(!res.writableEnded){
                    updatedNode.tokens = generateTokens({id: updatedNode.id, tipo: updatedNode.tipo, username: updatedNode.username, nome: updatedNode.nome}, res);
                    trans.commit();
                    res.send(updatedNode);
                }
            })
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

/**
 * @swagger
 * 
 * /api/profile/{tipoUser}/{id}/ativar:
 *      put:
 *          description: Ativa um utilizador desativo ou desativa um utilizador ativo. Possível quando logged in como um administrador.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: path
 *                name: tipoUser
 *              - in: path
 *                name: id
 * 
 *          responses:
 *              '200':
 *                  description: Utilizador ativado ou desativado com sucesso. Devolve informação do utilizador.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para visualizar as informações deste utilizador ou o token de acesso está fora de validade.
 */   
app.put("/api/profile/:tipoUser/:id/ativar", (req, res) => {

    var session = driver.session();

    user = validateToken(req, res);

    var updatedNode = {};

    var trans;

    var pesquisa = async () => {

        trans = session.beginTransaction();

        await trans.run(`MATCH (u:${req.params.tipoUser}) WHERE u.id = ${req.params.id} RETURN u`)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Utilizador não encontrado.");
                    trans.rollback();
                } else {
                    await trans.run(`MATCH (u:${req.params.tipoUser}) WHERE u.id = ${req.params.id} SET u.ativo = NOT u.ativo RETURN u`)
                        .then((result) => {
                            updatedNode.id = result.records[0]._fields[0].properties.id.low;
                            updatedNode.nome = result.records[0]._fields[0].properties.nome;
                            updatedNode.username = result.records[0]._fields[0].properties.username;
                            updatedNode.nCC = result.records[0]._fields[0].properties.nCC;
                            updatedNode.ativo = result.records[0]._fields[0].properties.ativo;
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        })
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
                trans.rollback();
            })
    }

    if(user && user.tipo == 'Administrador'){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, updatedNode).then(() => {
            pesquisa().then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(200).send(updatedNode);
                }
            })
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

/**
 * @swagger
 * 
 * /api/registos:
 *      get:
 *          description: Obtém informação de todos os registos que satisfazem os parametros de procura.
 *          parameters:
 *              - in: query
 *                name: search
 *              - in: query
 *                name: data
 *              - in: query
 *                name: ordem
 * 
 *          responses:
 *              '200':
 *                  description: Registos obtidos com sucesso. Devolve informação de todos esses registos.
 *                              
 *              '400':
 *                  description: Erro com o pedido. 
 * 
 *      post:
 *          description: Criar um novo registo. Possível quando logged in como um cidadão creditado.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              titulo:
 *                                  type: string
 *                                  required: true
 *                                  example: "registo teste"
 *                              descricao:
 *                                  type: string
 *                                  required: true
 *                                  example: "descricao do registo teste"
 *                              assuntos:
 *                                  type: array
 *                                  required: true
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: integer
 *                                              required: true
 *                                              example: 1
 *                                          tipo:
 *                                              type: string
 *                                              required: true
 *                                              example: "Politico"
 *          responses:
 *              '201':
 *                  description: Um novo registo foi criado com sucesso. Devolve a informação do registo criado.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para criar um registo ou o token de acesso está fora de validade.
 *                      
 */  
app.get("/api/registos", (req, res) => {

    var session = driver.session();

    var matchedNodes = [];

    var statement = "MATCH (c)-[:ESTA_EM*0..1]->(r:Registo)-[:ACERCA_DE*0..1]->(n), (cc:CidadaoCreditado)-[:CRIA]->(r:Registo)";

    if(req.query.data){
        switch(req.query.data){
            case "dia":
                statement = statement + ` WHERE r.data = date()`;
                break;
            case "mes":
                statement = statement + ` WHERE r.data.month = date().month AND r.data.year = date().year`;
                break;
            case "ano":
                statement = statement + ` WHERE r.data.year = date().year`;
                break;
        }
    }

    if(req.query.search){
        if(statement.includes("WHERE")){
            statement = statement + ` AND (r.nome =~ '(?i).*${req.query.search}.*' OR n.nome=~ '(?i).*${req.query.search}.*')`;
        } else {
            statement = statement + ` WHERE (r.nome =~ '(?i).*${req.query.search}.*' OR n.nome=~ '(?i).*${req.query.search}.*')`;
        }
    }

    statement = statement + " RETURN distinct r, COUNT(c.id), cc";

    if(req.query.data){
        if(req.query.data == 'antigoRecente'){
            statement = statement + " ORDER BY r.data ASC";
        } else if (req.query.data == 'recenteAntigo'){
            statement = statement + " ORDER BY r.data DESC";
        }
    }

    if(req.query.ordem){
        if(statement.includes("ORDER")){
            statement = statement + ", ";
        } else {
            statement = statement + " ORDER BY ";
        }

        switch(req.query.ordem){
            case "votosCres":
                statement = statement + "r.credibilidade ASC";
                break;
            case "votosDecres":
                statement = statement + "r.credibilidade DESC";
                break;
            case "comentariosCres":
                statement = statement + "COUNT(c.id) ASC";
                break;
            case "comentariosDescres":
                statement = statement + "COUNT(c.id) DESC";
                break;
        }
    }

    console.log(statement)
    
    session.run(statement)
        .then((result) => {
            result.records.forEach((record) => {
                matchedNodes.push({id: record._fields[0].properties.id.low, titulo: record._fields[0].properties.titulo, descricao: record._fields[0].properties.descricao, data: record._fields[0].properties.data, credibilidade: record._fields[0].properties.credibilidade.low, autor: record._fields[2].properties.nome});
            });
            res.status(200).send(matchedNodes);
        })
        .catch((error) => {
            console.log(error);
            res.status(400).send("Algo correu mal com a query.");
        });
});

/**
 * @swagger
 * 
 * /api/registos/{id}:
 *      get:
 *          description: Obtém informação de um registo.
 *          parameters:
 *              - in: path
 *                name: id
 * 
 *          responses:
 *              '200':
 *                  description: Registo obtido com sucesso. Devolve informação do registo.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '404':
 *                  description: Registo não encontrado.
 */ 
app.get("/api/registos/:id", (req, res) => {

    var session = driver.session();

    var matchedNode = {registo: {}, autor: {}, comentarios: [], assuntos: [], votos: []};

    var pesquisa = async () => {
        await session.run(`MATCH (r:Registo) WHERE r.id = ${req.params.id} RETURN r`)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Registo não encontrado.");
                } else {
                    matchedNode.registo = {id: result.records[0]._fields[0].properties.id.low, titulo: result.records[0]._fields[0].properties.titulo, descricao: result.records[0]._fields[0].properties.descricao, credibilidade: result.records[0]._fields[0].properties.credibilidade.low};
                    await session.run(`MATCH (c:CidadaoCreditado)-[:CRIA]->(r:Registo) WHERE r.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            if(result.records.length > 0){
                                matchedNode.autor = {id: result.records[0]._fields[0].properties.id.low, nome: result.records[0]._fields[0].properties.nome, username: result.records[0]._fields[0].properties.username, nCC: result.records[0]._fields[0].properties.nCC.low};
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (r:Registo)-[:ACERCA_DE]->(n) WHERE r.id = ${req.params.id} RETURN n`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.assuntos.push({tipo: `${record._fields[0].labels[0]}`, id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (n)-[:COMENTA]->(c:Comentario)-[:ESTA_EM]->(r:Registo) WHERE r.id = ${req.params.id} RETURN n, c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.comentarios.push({id: record._fields[1].properties.id.low, descricao: record._fields[1].properties.descricao, data: record._fields[1].properties.data, autor: record._fields[0].properties.id.low, tipoAutor: record._fields[0].labels[0], nomeAutor: record._fields[0].properties.nome});
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                
                    await session.run(`MATCH (u)-[v:VOTA_EM]->(r:Registo) WHERE r.id = ${req.params.id} RETURN u, v`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.votos.push({id: record._fields[0].properties.id.low, tipo: record._fields[0].labels[0], valor: record._fields[1].properties.valor.low})
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        }) 
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })
    }

    pesquisa().then(() => {
        if(!res.writableEnded){
            res.status(200).send(matchedNode);    
        }
    })
});

app.post("/api/registos", (req, res) => {

    var session = driver.session();

    const result = validateRegisto(req.body);
    if(result.error) return res.status(400).send(result.error);

    var user = validateToken(req, res);

    var inserted = {registo: {}, assuntos: []};

    var idGrande = uuidGen.uuid();
    var id = idGrande % 10000000;

    var trans;

    var pesquisa = async () => {

        trans = session.beginTransaction();

        await trans.run(`MATCH (c:CidadaoCreditado) WHERE c.id = ${user.id} CREATE (r:Registo {id: ${id}, titulo: '${req.body.titulo}', descricao: '${req.body.descricao}', credibilidade: 1, data: date()}) CREATE (c)-[:CRIA]->(r) RETURN r`)
            .then((result) => {
                inserted.registo = {id: id, titulo: `${req.body.titulo}`, descricao: `${req.body.descricao}`, credibilidade: 1, data: result.records[0]._fields[0].properties.data, criador: req.body.criador};
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
                trans.rollback();
            });
        
        if(req.body.assuntos){
            for(assunto of req.body.assuntos){
                await trans.run(`MATCH (r:Registo) WHERE r.id = ${id} MATCH (a:${assunto.tipo}) WHERE a.id = ${assunto.id} CREATE (r)-[:ACERCA_DE]->(a) RETURN a`)
                    .then((result) => {
                        inserted.assuntos.push({id: result.records[0]._fields[0].properties.id.low, tipo: result.records[0]._fields[0].labels[0]});
                    })
                    .catch((error) => {
                        console.log(error);
                        res.status(400).send("Algo correu mal com a query.");
                        trans.rollback();
                    });
            }    
        }
    }

    if(user && user.tipo == 'CidadaoCreditado'){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, inserted).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(201).send(inserted);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

/**
 * @swagger
 * 
 * /api/eventos:
 *      get:
 *          description: Obtém informação de todos os eventos que satisfazem os parametros de procura.
 *          parameters:
 *              - in: query
 *                name: search
 *              - in: query
 *                name: data
 *              - in: query
 *                name: exclusividade
 * 
 *          responses:
 *              '200':
 *                  description: Eventos obtidos com sucesso. Devolve informação de todos esses eventos.
 *                              
 *              '400':
 *                  description: Erro com o pedido. 
 * 
 *      post:
 *          description: Criar um novo evento. Possível quando logged in como um empresário ou político.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              nome:
 *                                  type: string
 *                                  required: true
 *                                  example: "evento teste"
 *                              descricao:
 *                                  type: string
 *                                  required: true
 *                                  example: "descricao do evento teste"
 *                              exclusividade:
 *                                  type: string
 *                                  required: true
 *                                  example: "Privado"
 *                              dataInicio:
 *                                  type: string
 *                                  required: true
 *                                  example: "2020-12-03"
 *                              dataFim:
 *                                  type: string
 *                                  required: true
 *                                  example: "2020-12-04"
 *                              organizacao:
 *                                  type: string
 *                                  example: 3
 *                              convidados:
 *                                  type: array
 *                                  required: true
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: integer
 *                                              required: true
 *                                              example: 2
 *                                          tipo:
 *                                              type: string
 *                                              required: true
 *                                              example: "Politico"
 *          responses:
 *              '201':
 *                  description: Um novo evento foi criado com sucesso. Devolve a informação do evento criado.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta ou o utilizador não pertence à organização com a qual tentou criar o evento.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para criar um evento ou o token de acesso está fora de validade.
 *             
 */
app.get("/api/eventos", (req, res) => {

    var session = driver.session();

    var matchedNodes = [];

    var statement = "MATCH (e:Evento)";

    if(req.query.data){
        switch(req.query.data){
            case "dia":
                statement = statement + ` WHERE e.dataInicio = date()`;
                break;
            case "mes":
                statement = statement + ` WHERE e.dataInicio.month = date().month AND e.dataInicio.year = date().year`;
                break;
            case "ano":
                statement = statement + ` WHERE e.dataInicio.year = date().year`;
                break;
        }
    }

    if(req.query.search){
        if(statement.includes("WHERE")){
            statement = statement + ` AND e.nome =~ '(?i).*${req.query.search}.*'`;
        } else {
            statement = statement + ` WHERE e.nome =~ '(?i).*${req.query.search}.*'`;
        }
    }

    if(req.query.exclusividade){
        if(statement.includes("WHERE")){
            statement = statement + ` AND e.exclusividade = '${req.query.exclusividade}'`;
        } else {
            statement = statement + ` WHERE e.exclusividade = '${req.query.exclusividade}'`;
        }
    }

    statement = statement + " RETURN e";

    if(req.query.data){
        if(req.query.data == 'antigoRecente'){
            statement = statement + " ORDER BY e.dataInicio ASC";
        } else if (req.query.data == 'recenteAntigo'){
            statement = statement + " ORDER BY e.dataInicio DESC";
        }
    }
        
    session.run(statement)
        .then((result) => {
            result.records.forEach((record) => {
                matchedNodes.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome, descricao: record._fields[0].properties.descricao, dataInicio: record._fields[0].properties.dataInicio, dataFim: record._fields[0].properties.dataFim, exclusividade: record._fields[0].properties.exclusividade});
            });
            res.status(200).send(matchedNodes);
        })
        .catch((error) => {
            console.log(error);
            res.status(400).send("Algo correu mal com a query.");
        });
});

/**
 * @swagger
 * 
 * /api/eventos/{id}:
 *      get:
 *          description: Obtém informação de um evento.
 *          parameters:
 *              - in: path
 *                name: id
 * 
 *          responses:
 *              '200':
 *                  description: Evento obtido com sucesso. Devolve informação do evento.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '404':
 *                  description: Evento não encontrado.
 * 
 *      put:
 *          description: Atualizar informação de um evento. Possível quando logged in como como um político ou empresário.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: path
 *                name: id
 * 
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              nome:
 *                                  type: string
 *                                  required: true
 *                                  example: "evento teste 2"
 *                              descricao:
 *                                  type: string
 *                                  required: true
 *                                  example: "descricao do evento teste 2"
 *                              exclusividade:
 *                                  type: string
 *                                  required: true
 *                                  example: "Privado"
 *                              dataInicio:
 *                                  type: string
 *                                  required: true
 *                                  example: "2019-12-03"
 *                              dataFim:
 *                                  type: string
 *                                  required: true
 *                                  example: "2019-12-04"
 *                              convidados:
 *                                  type: array
 *                                  required: true
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: integer
 *                                              required: true
 *                                              example: 1
 *                                          tipo:
 *                                              type: string
 *                                              required: true
 *                                              example: "Politico"
 * 
 *          responses:
 *              '200':
 *                  description: Informações do evento alteradas com sucesso. Devolve novas informações do evento.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta ou o utilizador não pertence à organização com a qual está a tentar alterar o evento.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para alterar as informações deste evento ou o token de acesso está fora de validade.
 *              
 *              '404':
 *                  description: Evento não encontrado.
 *
 *      delete:
 *          description: Apaga um evento. Possível quando logged in como político ou empresário.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: path
 *                name: id
 * 
 *          responses:
 *              '200':
 *                  description: O evento foi apagado com sucesso. Devolve a informação do evento.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta ou o utilizador não pertence à organização com a qual está a tentar apagar o evento.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para apagar um evento ou o token de acesso está fora de validade.
 *                    
 *              '404':
 *                  description: Evento não encontrado.  
 */
app.get("/api/eventos/:id", (req, res) => {
    
    var session = driver.session();

    var matchedNode = {evento: {}, organizador: {}, criador: {}, participantes: []};

    var pesquisa = async () => {
        await session.run(`MATCH (o)-[:ORGANIZA]->(e:Evento) WHERE e.id = ${req.params.id} RETURN o, e`)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Evento não encontrado.");
                } else{
                    matchedNode.organizador = {id: result.records[0]._fields[0].properties.id.low, tipo: result.records[0]._fields[0].labels[0], nome: result.records[0]._fields[0].properties.nome};
                    matchedNode.evento = {id: result.records[0]._fields[1].properties.id.low, nome: result.records[0]._fields[1].properties.nome, descricao: result.records[0]._fields[1].properties.descricao, exclusividade: result.records[0]._fields[1].properties.exclusividade, dataInicio: result.records[0]._fields[1].properties.dataInicio, dataFim: result.records[0]._fields[1].properties.dataFim}; 
                    await session.run(`MATCH (p)-[:PARTICIPA_EM]->(e:Evento) WHERE e.id = ${req.params.id} RETURN p`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.participantes.push({id: record._fields[0].properties.id.low, tipo: `${record._fields[0].labels[0]}`, nome: record._fields[0].properties.nome})
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        });

                    await session.run(`MATCH (u)-[r:CRIA]->(e:Evento) WHERE e.id = ${req.params.id} RETURN u`)
                        .then((result) => {
                            matchedNode.criador = {id: result.records[0]._fields[0].properties.id.low, tipo: result.records[0]._fields[0].labels[0], nome: result.records[0]._fields[0].properties.nome};
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })   
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })
    }

    pesquisa().then(() => {
        if(!res.writableEnded){
            res.status(200).send(matchedNode);
        }
    });
});

app.post("/api/eventos", (req, res) => {

    var session = driver.session();

    const result = validateEvento(req.body);
    if(result.error) return res.status(400).send(result.error);

    user = validateToken(req, res);

    var idGrande = uuidGen.uuid();
    var id = idGrande % 10000000;

    var inserted = {evento: {}, convidados: [], organizador: {}};

    var trans;

    var pesquisa = async (user) => {

        trans = session.beginTransaction();

        if(req.body.organizacao){
            await trans.run(`MATCH (u:${user.tipo})-[p:PERTENCE_A]->(o:Organizacao) WHERE u.id = ${user.id} AND o.id = ${req.body.organizacao} RETURN p`)
                .then(async (result) => {
                    if(result.records.length == 0){
                        res.status(401).send("Não pertence à organização com a qual está a tentar criar o evento.");
                        trans.rollback();
                    } else {
                        await trans.run(`MATCH (o:Organizacao) WHERE o.id = ${req.body.organizacao} MATCH (u:${user.tipo}) WHERE u.id = ${user.id} CREATE (e:Evento {id: ${id}, nome: '${req.body.nome}', descricao: '${req.body.descricao}', exclusividade: '${req.body.exclusividade}', dataInicio: date('${req.body.dataInicio}'), dataFim: date('${req.body.dataFim}')}) CREATE (o)-[:ORGANIZA]->(e) CREATE (u)-[:CRIA]->(e) RETURN e`)
                            .then((result) => {
                                inserted.evento = {id: id, nome: `${req.body.nome}`, descricao: `${req.body.descricao}`, exclusividade: `${req.body.exclusividade}`, dataInicio: `${req.body.dataInicio}`, dataFim: `${req.body.dataFim}`};
                                inserted.organizador = {id: req.body.organizacao, tipo: `Organizacao`};
                            })
                            .catch((error) => {
                                console.log(error);
                                res.status(400).send("Algo correu mal com a query.");
                                trans.rollback();
                            });
                    
                        if(req.body.convidados){
                            for(convidado of req.body.convidados){
                                await trans.run(`MATCH (e:Evento) WHERE e.id = ${id} MATCH (c:${convidado.tipo}) WHERE c.id = ${convidado.id} CREATE (c)-[:PARTICIPA_EM]->(e) RETURN c`)
                                    .then((result) => {
                                        inserted.convidados.push({id: result.records[0]._fields[0].properties.id.low, tipo: result.records[0]._fields[0].labels[0]});
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        res.status(400).send("Algo correu mal com a query.");
                                        trans.rollback();
                                    });
                            }    
                        } 
                    }
                })
                .catch((error) => {
                    console.log(error);
                    res.status(400).send("Algo correu mal com a query.");
                    trans.rollback();
                })
        } else {
            await trans.run(`MATCH (o:${user.tipo}) WHERE o.id = ${user.id} CREATE (e:Evento {id: ${id}, nome: '${req.body.nome}', descricao: '${req.body.descricao}', exclusividade: '${req.body.exclusividade}', dataInicio: date('${req.body.dataInicio}'), dataFim: date('${req.body.dataFim}')}) CREATE (o)-[:ORGANIZA]->(e) CREATE (o)-[:CRIA]->(e) RETURN e`)
                .then((result) => {
                    inserted.evento = {id: id, nome: `${req.body.nome}`, descricao: `${req.body.descricao}`, exclusividade: `${req.body.exclusividade}`, dataInicio: `${req.body.dataInicio}`, dataFim: `${req.body.dataFim}`};
                    inserted.organizador = {id: user.id, tipo: `${user.tipo}`};
                })
                .catch((error) => {
                    console.log(error);
                    res.status(400).send("Algo correu mal com a query.");
                    trans.rollback();
                });
            
            if(req.body.convidados){
                for(convidado of req.body.convidados){
                    await trans.run(`MATCH (e:Evento) WHERE e.id = ${id} MATCH (c:${convidado.tipo}) WHERE c.id = ${convidado.id} CREATE (c)-[:PARTICIPA_EM]->(e) RETURN c`)
                        .then((result) => {
                            inserted.convidados.push({id: result.records[0]._fields[0].properties.id.low, tipo: result.records[0]._fields[0].labels[0]});
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        });
                }    
            }    
        }
    }

    if(user && (user.tipo == 'Empresario' ||  user.tipo == 'Politico')){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, inserted).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(201).send(inserted);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

app.put("/api/eventos/:id", (req, res) => {

    var session = driver.session();

    const result = validateAlterarEvento(req.body);
    if(result.error) return res.status(400).send(result.error);

    user = validateToken(req, res);

    var updatedNode = {evento: {}, convidados: []};

    var statement = `MATCH (o:${user.tipo})-[:CRIA]->(e:Evento) WHERE e.id = ${req.params.id} AND o.id = ${user.id} `;
    
    if(req.body.nome){
        statement = statement + `SET e.nome = '${req.body.nome}' `;
    }
    if(req.body.descricao){
        if(statement.includes("SET")){
            statement = statement + `, e.descricao = '${req.body.descricao}' `;
        } else {
            statement = statement + `SET e.descricao = '${req.body.descricao}' `;
        }
    }
    if(req.body.exclusividade){
        if(statement.includes("SET")){
            statement = statement + `, e.exclusividade = '${req.body.exclusividade}' `;
        } else {
            statement = statement + `SET e.exclusividade = '${req.body.exclusividade}' `;
        }
    }
    if(req.body.dataInicio){
        if(statement.includes("SET")){
            statement = statement + `, e.dataInicio = date('${req.body.dataInicio}') `;
        } else {
            statement = statement + `SET e.dataInicio = date('${req.body.dataInicio}') `;
        }
    }
    if(req.body.dataFim){
        if(statement.includes("SET")){
            statement = statement + `, e.dataFim = date('${req.body.dataFim}') `;
        } else {
            statement = statement + `SET e.dataFim = date('${req.body.dataFim}') `;
        }
    }

    statement = statement + "RETURN e";

    var trans;

    var pesquisa = async (user) => {

        trans = session.beginTransaction();

        
        await trans.run(statement)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Evento não encontrado.");
                    trans.rollback();
                } else {
                    updatedNode.evento = {id: req.params.id, nome: `${result.records[0]._fields[0].properties.nome}`, descricao: `${result.records[0]._fields[0].properties.descricao}`, exclusividade: `${result.records[0]._fields[0].properties.exclusividade}`, dataInicio: `${result.records[0]._fields[0].properties.dataInicio}`, dataFim: `${result.records[0]._fields[0].properties.dataFim}`};
                    await trans.run(`MATCH (n)-[p:PARTICIPA_EM]->(e:Evento) WHERE e.id = ${req.params.id} DELETE p`)
                        .then(async (result) => {
                            if(req.body.convidados){
                                for(convidado of req.body.convidados){
                                    await trans.run(`MATCH (e:Evento) WHERE e.id = ${req.params.id} MATCH (c:${convidado.tipo}) WHERE c.id = ${convidado.id} CREATE (c)-[:PARTICIPA_EM]->(e) RETURN c`)
                                        .then((result) => {
                                            updatedNode.convidados.push({id: result.records[0]._fields[0].properties.id.low, tipo: result.records[0]._fields[0].labels[0]});
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                            res.status(400).send("Algo correu mal com a query.");
                                            trans.rollback();
                                        });
                                }
                            }                      
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        });            
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
                trans.rollback();
            });
    }

    if(user && (user.tipo == 'Empresario' ||  user.tipo == 'Politico')){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, updatedNode).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(200).send(updatedNode);
                }
            })
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

app.delete("/api/eventos/:id", (req, res) => {

    var session = driver.session();

    const result = validateApagarEvento(req.body);
    if(result.error) return res.status(400).send(result.error);

    var deletedNode = {};

    user = validateToken(req, res);

    var trans;

    var statement;

    if(user.tipo == "Administrador"){
        statement = `MATCH (e:Evento) WHERE e.id = ${req.params.id}`;
    } else {
        statement = `MATCH (o:${user.tipo})-[:CRIA]->(e:Evento) WHERE e.id = ${req.params.id} AND o.id = ${user.id}`;
    }

    statement += " WITH e, e.dataInicio AS dataInicio, e.dataFim AS dataFim, e.exclusividade AS exclusividade, e.nome AS nome, e.descricao AS descricao DETACH DELETE e RETURN nome, descricao, exclusividade, dataInicio, dataFim";
    
    var pesquisa = async (user) => {

        trans = session.beginTransaction();

        await trans.run(statement)
            .then((result) => {
                if(result.records.length == 0){
                    res.status(404).send("Evento não encontrado.");
                    trans.rollback();
                } else {
                    deletedNode.id = req.params.id;
                    deletedNode.nome = `${result.records[0]._fields[0]}`;
                    deletedNode.descricao = `${result.records[0]._fields[1]}`;
                    deletedNode.exclusividade = `${result.records[0]._fields[2]}`;
                    deletedNode.dataInicio = `${result.records[0]._fields[3]}`;
                    deletedNode.dataFim = `${result.records[0]._fields[4]}`;
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
                trans.rollback();
            });
    }
    
    if(user && (user.tipo == 'Empresario' ||  user.tipo == 'Politico' || user.tipo == 'Administrador')){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, deletedNode).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(200).send(deletedNode);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

/**
 * @swagger
 * 
 * /api/eventos/{id}/participar:
 *      post:
 *          description: Participar num evento ou deixar de participar caso já esteja a participar. Possível quando logged in como não administrador.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: path
 *                name: id
 * 
 *          responses:
 *              '201':
 *                  description: Participação alterada com sucesso.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para se participar/cancelar participação num evento ou o token de acesso está fora de validade.
 *              
 *              '404':
 *                  description: Evento não encontrado.
 */ 
app.post("/api/eventos/:id/participar", (req, res) => {

    var session = driver.session();

    var changedNode = {};

    var trans;

    var user = validateToken(req, res);

    var pesquisa = async (user) => {

        trans = session.beginTransaction();
        
        await trans.run(`MATCH (e:Evento) WHERE e.id = ${req.params.id} RETURN e`)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Evento não encontrado.");
                    trans.rollback();
                } else {
                    await trans.run(`MATCH (u:${user.tipo})-[p:PARTICIPA_EM]->(e:Evento) WHERE e.id = ${req.params.id} AND u.id = ${user.id} WITH p, p AS participacao DELETE p RETURN participacao`)
                        .then(async (result) => {
                            if(result.records.length == 0){
                                await trans.run(`MATCH (u:${user.tipo}) WHERE u.id = ${user.id} MATCH (e:Evento) WHERE e.id = ${req.params.id} AND e.exclusividade = 'Publico' AND e.dataFim > date() CREATE (u)-[:PARTICIPA_EM]->(e) RETURN e`)
                                    .then((result) => {
                                        if(result.records.length == 0){
                                            res.status(401).send("O evento em que está a tentar participar é privado ou já terminou.");
                                            trans.rollback();
                                        } else {
                                            changedNode.tipoUser = user.tipo;
                                            changedNode.user = user.id;
                                            changedNode.evento = req.body.evento; 
                                        }
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        res.status(400).send("Algo correu mal com a query.");
                                        trans.rollback();       
                                    })
                            } else {
                                changedNode.tipoUser = user.tipo;
                                changedNode.user = user.id;
                                changedNode.evento = req.body.evento;
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        })
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
                trans.rollback();
            })
    }

    if(user && user.tipo != 'Administrador'){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, changedNode).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(201).send(changedNode);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

/**
 * @swagger
 * 
 * /api/concursos:
 *      get:
 *          description: Obtém informação de todos os concursos que satisfazem os parametros de procura.
 *          parameters:
 *              - in: query
 *                name: search
 *              - in: query
 *                name: data
 *              - in: query
 *                name: tipo
 * 
 *          responses:
 *              '200':
 *                  description: Concursos obtidos com sucesso. Devolve informação de todos esses concursos.
 *                              
 *              '400':
 *                  description: Erro com o pedido. 
 * 
 *      post:
 *          description: Criar um novo concurso. Possível quando logged in como um empresário ou político.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              nome:
 *                                  type: string
 *                                  required: true
 *                                  example: "concurso teste"
 *                              descricao:
 *                                  type: string
 *                                  required: true
 *                                  example: "descricao do concurso teste"
 *                              tipo:
 *                                  type: string
 *                                  required: true
 *                                  example: "Outro"
 *                              dataInicio:
 *                                  type: string
 *                                  required: true
 *                                  example: "2020-12-03"
 *                              dataFim:
 *                                  type: string
 *                                  required: true
 *                                  example: "2020-12-04"
 *                              organizacao:
 *                                  type: string
 *                                  example: 3
 *                              participantes:
 *                                  type: array
 *                                  required: true
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: integer
 *                                              required: true
 *                                              example: 3
 *                                          tipo:
 *                                              type: string
 *                                              required: true
 *                                              example: "Empresario"
 *                              vencedores:
 *                                  type: array
 *                                  required: true
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: integer
 *                                              required: true
 *                                              example: 3
 *                                          tipo:
 *                                              type: string
 *                                              required: true
 *                                              example: "Empresario"
 *          responses:
 *              '201':
 *                  description: Um novo concurso foi criado com sucesso. Devolve a informação do concurso criado.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta ou o utilizador não pertence à organização com a qual tentou criar o concurso.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para criar um concurso ou o token de acesso está fora de validade.
 */
app.get("/api/concursos", (req, res) => {

    var session = driver.session();

    var matchedNodes = [];

    var statement = "MATCH (c:Concurso)";

    if(req.query.data){
        switch(req.query.data){
            case "dia":
                statement = statement + ` WHERE c.dataInicio = date()`;
                break;
            case "mes":
                statement = statement + ` WHERE c.dataInicio.month = date().month AND c.dataInicio.year = date().year`;
                break;
            case "ano":
                statement = statement + ` WHERE c.dataInicio.year = date().year`;
                break;
        }
    }

    if(req.query.search){
        if(statement.includes("WHERE")){
            statement = statement + ` AND c.nome =~ '(?i).*${req.query.search}.*'`;
        } else {
            statement = statement + ` WHERE c.nome =~ '(?i).*${req.query.search}.*'`;
        }
    }

    if(req.query.tipo){
        if(statement.includes("WHERE")){
            statement = statement + ` AND c.tipo = '${req.query.tipo}'`;
        } else {
            statement = statement + ` WHERE c.tipo = '${req.query.tipo}'`;
        }
    }

    statement = statement + " RETURN c";

    if(req.query.data){
        if(req.query.data == 'antigoRecente'){
            statement = statement + " ORDER BY c.dataInicio ASC";
        } else if (req.query.data == 'recenteAntigo'){
            statement = statement + " ORDER BY c.dataInicio DESC";
        }
    }

    session.run(statement)
        .then((result) => {
            result.records.forEach((record) => {
                matchedNodes.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome, descricao: record._fields[0].properties.descricao, dataInicio: record._fields[0].properties.dataInicio, dataFim: record._fields[0].properties.dataFim, conclusao: record._fields[0].properties.conclusao, tipo: record._fields[0].properties.tipo});
            });
            res.status(200).send(matchedNodes);
        })
        .catch((error) => {
            console.log(error);
            res.status(400).send("Algo correu mal com a query.");
        });
});

/**
 * @swagger
 * 
 * /api/concursos/{id}:
 *      get:
 *          description: Obtém informação de um concurso.
 *          parameters:
 *              - in: path
 *                name: id
 * 
 *          responses:
 *              '200':
 *                  description: Concurso obtido com sucesso. Devolve informação do concurso.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '404':
 *                  description: Concurso não encontrado.
 * 
 *      put:
 *          description: Atualizar informação de um concurso. Possível quando logged in como como um político ou empresário.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: path
 *                name: id
 * 
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              nome:
 *                                  type: string
 *                                  required: true
 *                                  example: "concurso teste 2"
 *                              descricao:
 *                                  type: string
 *                                  required: true
 *                                  example: "descricao do concurso teste 2"
 *                              tipo:
 *                                  type: string
 *                                  required: true
 *                                  example: "Outro"
 *                              dataInicio:
 *                                  type: string
 *                                  required: true
 *                                  example: "2019-12-03"
 *                              dataFim:
 *                                  type: string
 *                                  required: true
 *                                  example: "2019-12-04"
 *                              participantes:
 *                                  type: array
 *                                  required: true
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: integer
 *                                              required: true
 *                                              example: 2
 *                                          tipo:
 *                                              type: string
 *                                              required: true
 *                                              example: "Empresario"
 *                              vencedores:
 *                                  type: array
 *                                  required: true
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: integer
 *                                              required: true
 *                                              example: 2
 *                                          tipo:
 *                                              type: string
 *                                              required: true
 *                                              example: "Empresario"
 * 
 *          responses:
 *              '200':
 *                  description: Informações do concurso alteradas com sucesso. Devolve novas informações do concurso.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta ou o utilizador não pertence à organização com a qual está a tentar alterar o concurso.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para alterar as informações deste concurso ou o token de acesso está fora de validade.
 *              
 *              '404':
 *                  description: Concurso não encontrado.
 * 
 *      delete:
 *          description: Apaga um concurso. Possível quando logged in como político ou empresário.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: path
 *                name: id
 * 
 *          responses:
 *              '200':
 *                  description: O concurso foi apagado com sucesso. Devolve a informação do concurso.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta ou o utilizador não pertence à organização com a qual está a tentar apagar o concurso.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para apagar um concurso ou o token de acesso está fora de validade.
 *                    
 *              '404':
 *                  description: Concurso não encontrado. 
 */ 
app.get("/api/concursos/:id", (req, res) => {

    var session = driver.session();

    var matchedNode = {concurso: {}, organizador: {}, criador: {}, participantes: [], vencedores: [], contratos: []};

    var pesquisa = async () => {
        await session.run(`MATCH (c:Concurso) WHERE c.id = ${req.params.id} RETURN c`)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Concurso não encontrado.");
                } else {
                    matchedNode.concurso = {id: result.records[0]._fields[0].properties.id.low, nome: result.records[0]._fields[0].properties.nome, descricao: result.records[0]._fields[0].properties.descricao, dataInicio: result.records[0]._fields[0].properties.dataInicio, dataFim: result.records[0]._fields[0].properties.dataFim, tipo: result.records[0]._fields[0].properties.tipo};
                    await session.run(`MATCH (o)-[:ORGANIZA]->(c:Concurso) WHERE c.id = ${req.params.id} RETURN o`)
                        .then((result) => {
                            if(result.records.length > 0){
                                matchedNode.organizador = {id: result.records[0]._fields[0].properties.id.low, tipo: result.records[0]._fields[0].labels[0], nome: result.records[0]._fields[0].properties.nome};    
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                    
                    await session.run(`MATCH (u)-[r:CRIA]->(c:Concurso) WHERE c.id = ${req.params.id} RETURN u`)
                        .then((result) => {
                            matchedNode.criador = {id: result.records[0]._fields[0].properties.id.low, tipo: result.records[0]._fields[0].labels[0], nome: result.records[0]._fields[0].properties.nome};
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (p)-[:PARTICIPA_EM]->(c:Concurso) WHERE c.id = ${req.params.id} RETURN p`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.participantes.push({tipo: `${record._fields[0].labels[0]}`, id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (p)-[:VENCE]->(c:Concurso) WHERE c.id = ${req.params.id} RETURN p`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.vencedores.push({tipo: `${record._fields[0].labels[0]}`, id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (c:Concurso)-[:GERA]->(ca:Contrato) WHERE c.id = ${req.params.id} RETURN ca`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.contratos.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })        
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })
    }

    pesquisa().then(() => {
        if(!res.writableEnded){
            res.status(200).send(matchedNode);    
        }
    })
});

app.post("/api/concursos", (req, res) => {

    var session = driver.session();

    const result = validateConcurso(req.body);
    if(result.error) return res.status(400).send(result.error);

    var user = validateToken(req, res);

    var idGrande = uuidGen.uuid();
    var id = idGrande % 10000000;

    var inserted = {concurso: {}, participantes: [], vencedores: [], organizador: {}};

    var trans;

    var pesquisa = async (user) => {

        trans = session.beginTransaction();

        if(req.body.organizacao){
            await trans.run(`MATCH (u:${user.tipo})-[p:PERTENCE_A]->(o:Organizacao) WHERE u.id = ${user.id} AND o.id = ${req.body.organizacao} RETURN p`)
                .then(async (result) => {
                    if(result.records.length == 0){
                        res.status(401).send("Não pertence à organização com a qual está a tentar criar o concurso.");
			            trans.rollback();
                    } else {
                        await trans.run(`MATCH (o:Organizacao) WHERE o.id = ${req.body.organizacao} MATCH (u:${user.tipo}) WHERE u.id = ${user.id} CREATE (c:Concurso {id: ${id}, nome: '${req.body.nome}', descricao: '${req.body.descricao}', tipo: '${req.body.tipo}', dataInicio: date('${req.body.dataInicio}'), dataFim: date('${req.body.dataFim}')}) CREATE (o)-[:ORGANIZA]->(c) CREATE (u)-[:CRIA]->(c) RETURN c`)
                            .then((result) => {
                                inserted.concurso = {id: id, nome: `${req.body.nome}`, descricao: `${req.body.descricao}`, tipo: `${req.body.tipo}`, dataInicio: `${req.body.dataInicio}`, dataFim: `${req.body.dataFim}`};
                                inserted.organizador = {id: req.body.organizacao, tipo: `Organizacao`};
                            })
                            .catch((error) => {
                                console.log(error);
                                res.status(400).send("Algo correu mal com a query.");
                                trans.rollback();
                            });
            
                        if(req.body.vencedores){
                            for(vencedor of req.body.vencedores){
                                await trans.run(`MATCH (c:Concurso) WHERE c.id = ${id} MATCH (v:${vencedor.tipo}) WHERE v.id = ${vencedor.id} CREATE (v)-[:VENCE]->(c) RETURN v`)
                                    .then((result) => {
                                        inserted.vencedores.push({id: result.records[0]._fields[0].properties.id.low, tipo: result.records[0]._fields[0].labels[0]});
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        res.status(400).send("Algo correu mal com a query.");
                                        trans.rollback();
                                    });
                            }    
                        }
            
                        if(req.body.participantes){
                            for(participante of req.body.participantes){
                                await trans.run(`MATCH (c:Concurso) WHERE c.id = ${id} MATCH (p:${participante.tipo}) WHERE p.id = ${participante.id} CREATE (p)-[:PARTICIPA_EM]->(c) RETURN p`)
                                    .then((result) => {
                                        inserted.participantes.push({id: result.records[0]._fields[0].properties.id.low, tipo: result.records[0]._fields[0].labels[0]});
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        res.status(400).send("Algo correu mal com a query.");
                                        trans.rollback();
                                    });
                            }    
                        }   
                    }
                })
                .catch((error) => {
                    console.log(error);
                    res.status(400).send("Algo correu mal com a query.");
                    trans.rollback();
                })
        } else {
            await trans.run(`MATCH (o:${user.tipo}) WHERE o.id = ${user.id} CREATE (c:Concurso {id: ${id}, nome: '${req.body.nome}', descricao: '${req.body.descricao}', tipo: '${req.body.tipo}', dataInicio: date('${req.body.dataInicio}'), dataFim: date('${req.body.dataFim}')}) CREATE (o)-[:ORGANIZA]->(c) CREATE (o)-[:CRIA]->(c) RETURN c`)
                .then((result) => {
                    inserted.concurso = {id: id, nome: `${req.body.nome}`, descricao: `${req.body.descricao}`, tipo: `${req.body.tipo}`, dataInicio: `${req.body.dataInicio}`, dataFim: `${req.body.dataFim}`};
                    inserted.organizador = {id: user.id, tipo: `${user.tipo}`};
                })
                .catch((error) => {
                    console.log(error);
                    res.status(400).send("Algo correu mal com a query.");
                    trans.rollback();
                });

            if(req.body.vencedores){
                for(vencedor of req.body.vencedores){
                    await trans.run(`MATCH (c:Concurso) WHERE c.id = ${id} MATCH (v:${vencedor.tipo}) WHERE v.id = ${vencedor.id} CREATE (v)-[:VENCE]->(c) RETURN v`)
                        .then((result) => {
                            inserted.vencedores.push({id: result.records[0]._fields[0].properties.id.low, tipo: result.records[0]._fields[0].labels[0]});
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        });
                }    
            }

            if(req.body.participantes){
                for(participante of req.body.participantes){
                    await trans.run(`MATCH (c:Concurso) WHERE c.id = ${id} MATCH (p:${participante.tipo}) WHERE p.id = ${participante.id} CREATE (p)-[:PARTICIPA_EM]->(c) RETURN p`)
                        .then((result) => {
                            inserted.participantes.push({id: result.records[0]._fields[0].properties.id.low, tipo: result.records[0]._fields[0].labels[0]});
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        });
                }    
            }    
        }
    }

    if(user && (user.tipo == 'Empresario' ||  user.tipo == 'Politico')){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, inserted).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(201).send(inserted);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

app.put("/api/concursos/:id", (req, res) => {

    var session = driver.session();

    const result = validateAlterarConcurso(req.body);
    if(result.error) return res.status(400).send(result.error);

    var user = validateToken(req, res);

    var updatedNode = {concurso: {}, participantes: [], vencedores: []};

    var statement = `MATCH (o:${user.tipo})-[:CRIA]->(c:Concurso) WHERE c.id = ${req.params.id} AND o.id = ${user.id} `;

    if(req.body.nome){
        statement = statement + `SET c.nome = '${req.body.nome}' `;
    }
    if(req.body.descricao){
        if(statement.includes("SET")){
            statement = statement + `, c.descricao = '${req.body.descricao}' `;
        } else {
            statement = statement + `SET c.descricao = '${req.body.descricao}' `;
        }
    }
    if(req.body.tipo){
        if(statement.includes("SET")){
            statement = statement + `, c.tipo = '${req.body.tipo}' `;
        } else {
            statement = statement + `SET c.tipo = '${req.body.tipo}' `;
        }
    }
    if(req.body.dataInicio){
        if(statement.includes("SET")){
            statement = statement + `, c.dataInicio = date('${req.body.dataInicio}') `;
        } else {
            statement = statement + `SET c.dataInicio = date('${req.body.dataInicio}') `;
        }
    }
    if(req.body.dataFim){
        if(statement.includes("SET")){
            statement = statement + `, c.dataFim = date('${req.body.dataFim}') `;
        } else {
            statement = statement + `SET c.dataFim = date('${req.body.dataFim}') `;
        }
    }

    statement = statement + "RETURN c";

    var trans;

    var pesquisa = async (user) => {

        trans = session.beginTransaction();

        await trans.run(statement)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Concurso não encontrado.");
                    trans.rollback();
                } else {
                    updatedNode.concurso = {id: req.params.id, nome: `${result.records[0]._fields[0].properties.nome}`, descricao: `${result.records[0]._fields[0].properties.descricao}`, tipo: `${result.records[0]._fields[0].properties.tipo}`, dataInicio: `${result.records[0]._fields[0].properties.dataInicio}`, dataFim: `${result.records[0]._fields[0].properties.dataFim}`};
                    await trans.run(`MATCH (n)-[p:PARTICIPA_EM]->(c:Concurso) WHERE c.id = ${req.params.id} DELETE p`)
                        .then(async (result) => {
                            if(req.body.participantes){
                                for(participante of req.body.participantes){
                                    await trans.run(`MATCH (c:Concurso) WHERE c.id = ${req.params.id} MATCH (p:${participante.tipo}) WHERE p.id = ${participante.id} CREATE (p)-[:PARTICIPA_EM]->(c) RETURN p`)
                                        .then((result) => {
                                            updatedNode.participantes.push({id: result.records[0]._fields[0].properties.id.low, tipo: result.records[0]._fields[0].labels[0]});
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                            res.status(400).send("Algo correu mal com a query.");
                                            trans.rollback();
                                        });
                                }
                            } 
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        });

                    await trans.run(`MATCH (n)-[v:VENCE]->(c:Concurso) WHERE c.id = ${req.params.id} DELETE v`)
                        .then(async (result) => {
                            if(req.body.vencedores){
                                for(vencedor of req.body.vencedores){
                                    await trans.run(`MATCH (c:Concurso) WHERE c.id = ${req.params.id} MATCH (v:${vencedor.tipo}) WHERE v.id = ${vencedor.id} CREATE (v)-[:VENCE]->(c) RETURN v`)
                                        .then((result) => {
                                            updatedNode.vencedores.push({id: result.records[0]._fields[0].properties.id.low, tipo: result.records[0]._fields[0].labels[0]});
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                            res.status(400).send("Algo correu mal com a query.");
                                            trans.rollback();
                                        });
                                }
                            }          
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        });  
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
                trans.rollback();
            });  
    }

    if(user && (user.tipo == 'Empresario' ||  user.tipo == 'Politico')){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, updatedNode).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(200).send(updatedNode);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

app.delete("/api/concursos/:id", (req, res) => {

    var session = driver.session();

    const result = validateApagarConcurso(req.body);
    if(result.error) return res.status(400).send(result.error);

    var deletedNode = {};

    user = validateToken(req, res);

    var trans;

    var statement;

    if(user.tipo == "Administrador"){
        statement = `MATCH (c:Concurso) WHERE c.id = ${req.params.id}`;
    } else {
        statement = `MATCH (o:${user.tipo})-[:CRIA]->(c:Concurso) WHERE c.id = ${req.params.id} AND o.id = ${user.id}`
    }

    statement += " WITH c, c.dataInicio AS dataInicio, c.dataFim AS dataFim, c.tipo AS tipo, c.nome AS nome, c.descricao AS descricao DETACH DELETE c RETURN nome, descricao, tipo, dataInicio, dataFim";

    var pesquisa = async (user) =>{

        trans = session.beginTransaction();

        await trans.run(statement)
            .then((result) => {
                if(result.records.length == 0){
                    res.status(404).send("Concurso não encontrado.");
                    trans.rollback();
                } else {
                    deletedNode.id = req.params.id;
                    deletedNode.nome = `${result.records[0]._fields[0]}`;
                    deletedNode.descricao = `${result.records[0]._fields[1]}`;
                    deletedNode.tipo = `${result.records[0]._fields[2]}`;
                    deletedNode.dataInicio = `${result.records[0]._fields[3]}`;
                    deletedNode.dataFim = `${result.records[0]._fields[4]}`;
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
                trans.rollback();
            });    
    }

    if(user && (user.tipo == 'Empresario' ||  user.tipo == 'Politico' || user.tipo == 'Administrador')){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, deletedNode).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(200).send(deletedNode);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

/**
 * @swagger
 * 
 * /api/contratos:
 *      get:
 *          description: Obtém informação de todos os contratos que satisfazem os parametros de procura.
 *          parameters:
 *              - in: query
 *                name: search
 *              - in: query
 *                name: data
 *              - in: query
 *                name: tipo
 * 
 *          responses:
 *              '200':
 *                  description: Contratos obtidos com sucesso. Devolve informação de todos esses contratos.
 *                              
 *              '400':
 *                  description: Erro com o pedido. 
 * 
 *      post:
 *          description: Criar um novo contrato. Possível quando logged in como um empresário ou político.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              nome:
 *                                  type: string
 *                                  required: true
 *                                  example: "contrato teste"
 *                              descricao:
 *                                  type: string
 *                                  required: true
 *                                  example: "descricao do contrato teste"
 *                              conclusao:
 *                                  type: string
 *                                  required: true
 *                                  example: "descricao do contrato teste"
 *                              tipo:
 *                                  type: string
 *                                  required: true
 *                                  example: "Outro"
 *                              dataInicio:
 *                                  type: string
 *                                  required: true
 *                                  example: "2020-12-03"
 *                              dataFim:
 *                                  type: string
 *                                  required: true
 *                                  example: "2020-12-04"
 *                              organizacao:
 *                                  type: string
 *                                  example: 3
 *                              assinaturas:
 *                                  type: array
 *                                  required: true
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: integer
 *                                              required: true
 *                                              example: 2
 *                                          tipo:
 *                                              type: string
 *                                              required: true
 *                                              example: "Empresario"
 *                              proposicoes:
 *                                  type: array
 *                                  required: true
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: integer
 *                                              required: true
 *                                              example: 1
 *                                          tipo:
 *                                              type: string
 *                                              required: true
 *                                              example: "Organizacao"
 *                              concursos:
 *                                  type: array
 *                                  required: true
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: integer
 *                                              required: true
 *                                              example: 561664
 * 
 *          responses:
 *              '201':
 *                  description: Um novo contrato foi criado com sucesso. Devolve a informação do contrato criado.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta ou o utilizador não pertence à organização com a qual tentou criar o contrato.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para criar um contrato ou o token de acesso está fora de validade.
 */
app.get("/api/contratos", (req, res) => {

    var session = driver.session();

    var matchedNodes = [];

    var statement = "MATCH (c:Contrato)";

    if(req.query.data){
        switch(req.query.data){
            case "dia":
                statement = statement + ` WHERE c.dataInicio = date()`;
                break;
            case "mes":
                statement = statement + ` WHERE c.dataInicio.month = date().month AND c.dataInicio.year = date().year`;
                break;
            case "ano":
                statement = statement + ` WHERE c.dataInicio.year = date().year`;
                break;
        }
    }

    if(req.query.search){
        if(statement.includes("WHERE")){
            statement = statement + ` AND c.nome =~ '(?i).*${req.query.search}.*'`;
        } else {
            statement = statement + ` WHERE c.nome =~ '(?i).*${req.query.search}.*'`;
        }
    }

    if(req.query.tipo){
        if(statement.includes("WHERE")){
            statement = statement + ` AND c.tipo = '${req.query.tipo}'`;
        } else {
            statement = statement + ` WHERE c.tipo = '${req.query.tipo}'`;
        }
    }

    statement = statement + " RETURN c";

    if(req.query.data){
        if(req.query.data == 'antigoRecente'){
            statement = statement + " ORDER BY c.dataInicio ASC";
        } else if (req.query.data == 'recenteAntigo'){
            statement = statement + " ORDER BY c.dataInicio DESC";
        }
    }

    session.run(statement)
        .then((result) => {
            result.records.forEach((record) => {
                matchedNodes.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome, descricao: record._fields[0].properties.descricao, conclusao: record._fields[0].properties.conclusao, tipo: record._fields[0].properties.tipo, dataInicio: record._fields[0].properties.dataInicio, dataFim: record._fields[0].properties.dataFim, conclusao: record._fields[0].properties.conclusao});
            });
            res.status(200).send(matchedNodes);
        })
        .catch((error) => {
            console.log(error);
            res.status(400).send("Algo correu mal com a query.");
        });
});

/**
 * @swagger
 * 
 * /api/contratos/{id}:
 *      get:
 *          description: Obtém informação de um contrato.
 *          parameters:
 *              - in: path
 *                name: id
 * 
 *          responses:
 *              '200':
 *                  description: Contrato obtido com sucesso. Devolve informação do contrato.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '404':
 *                  description: Contrato não encontrado.
 * 
 *      put:
 *          description: Atualizar informação de um contrato. Possível quando logged in como como um político ou empresário.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: path
 *                name: id
 * 
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              nome:
 *                                  type: string
 *                                  required: true
 *                                  example: "contrato teste 2"
 *                              descricao:
 *                                  type: string
 *                                  required: true
 *                                  example: "descricao do contrato teste 2"
 *                              conclusao:
 *                                  type: string
 *                                  required: true
 *                                  example: "conclusao do contrato teste 2"
 *                              tipo:
 *                                  type: string
 *                                  required: true
 *                                  example: "Outro"
 *                              dataInicio:
 *                                  type: string
 *                                  required: true
 *                                  example: "2019-12-03"
 *                              dataFim:
 *                                  type: string
 *                                  required: true
 *                                  example: "2019-12-04"
 *                              assinaturas:
 *                                  type: array
 *                                  required: true
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: integer
 *                                              required: true
 *                                              example: 2
 *                                          tipo:
 *                                              type: string
 *                                              required: true
 *                                              example: "Empresario"
 *                              proposicoes:
 *                                  type: array
 *                                  required: true
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: integer
 *                                              required: true
 *                                              example: 2
 *                                          tipo:
 *                                              type: string
 *                                              required: true
 *                                              example: "Organizacao"
 *                              concursos:
 *                                  type: array
 *                                  required: true
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: integer
 *                                              required: true
 *                                              example: 561664
 * 
 *          responses:
 *              '200':
 *                  description: Informações do contrato alteradas com sucesso. Devolve novas informações do contrato.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta ou o utilizador não pertence à organização com a qual está a tentar alterar o contrato.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para alterar as informações deste contrato ou o token de acesso está fora de validade.
 *              
 *              '404':
 *                  description: Contrato não encontrado.
 * 
 *      delete:
 *          description: Apaga um contrato. Possível quando logged in como político ou empresário.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: path
 *                name: id
 * 
 *          responses:
 *              '200':
 *                  description: O contrato foi apagado com sucesso. Devolve a informação do contrato.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta ou o utilizador não pertence à organização com a qual está a tentar apagar o contrato.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para apagar um contrato ou o token de acesso está fora de validade.
 *                    
 *              '404':
 *                  description: Contrato não encontrado. 
 */ 
app.get("/api/contratos/:id", (req, res) => {

    var session = driver.session();

    var matchedNode = {contrato: {}, criador: {}, proposicoes: [], assinaturas: [], concursos: []};

    var pesquisa = async () => {
        await session.run(`MATCH (c:Contrato) WHERE c.id = ${req.params.id} RETURN c`)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Contrato não encontrado.");
                } else {
                    matchedNode.contrato = {id: result.records[0]._fields[0].properties.id.low, nome: result.records[0]._fields[0].properties.nome, descricao: result.records[0]._fields[0].properties.descricao, conclusao: result.records[0]._fields[0].properties.conclusao, dataInicio: result.records[0]._fields[0].properties.dataInicio, dataFim: result.records[0]._fields[0].properties.dataFim, tipo: result.records[0]._fields[0].properties.tipo};
                    await session.run(`MATCH (p)-[:PROPOE]->(c:Contrato) WHERE c.id = ${req.params.id} RETURN p`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.proposicoes.push({tipo: `${record._fields[0].labels[0]}`, id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (u)-[r:CRIA]->(c:Contrato) WHERE c.id = ${req.params.id} RETURN u, r`)
                        .then((result) => {
                            matchedNode.criador = {id: result.records[0]._fields[0].properties.id.low, tipo: result.records[0]._fields[0].labels[0], nome: result.records[0]._fields[0].properties.nome};
                            if(result.records[0]._fields[1].properties.org){
                                matchedNode.criador.org = result.records[0]._fields[1].properties.org.low;
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (a)-[:ASSINA]->(c:Contrato) WHERE c.id = ${req.params.id} RETURN a`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.assinaturas.push({tipo: `${record._fields[0].labels[0]}`, id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (co:Concurso)-[:GERA]->(c:Contrato) WHERE c.id = ${req.params.id} RETURN co`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome});
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })        
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })
    }

    pesquisa().then(() => {
        if(!res.writableEnded){
            res.status(200).send(matchedNode);
        }
    })
});

app.post("/api/contratos", (req, res) => {

    var session = driver.session();

    const result = validateContrato(req.body);
    if(result.error) return res.status(400).send(result.error);

    var user = validateToken(req, res);

    var inserted = {contrato: {}, assinaturas: [], proposicoes: [], concursos: []};

    var idGrande = uuidGen.uuid();
    var id = idGrande % 10000000;

    var trans;

    var pesquisa = async (user) => {

        trans = session.beginTransaction();

        if(req.body.organizacao){
            await trans.run(`MATCH (u:${user.tipo})-[p:PERTENCE_A]->(o:Organizacao) WHERE u.id = ${user.id} AND o.id = ${req.body.organizacao} RETURN p`)
                .then(async (result) => {
                    if(result.records.length == 0){
                        res.status(401).send("Não pertence à organização com a qual está a tentar criar o contrato.");
			            trans.rollback();
                    } else {
                        await trans.run(`MATCH (u:${user.tipo}) WHERE u.id = ${user.id} CREATE (c:Contrato {id: ${id}, nome: '${req.body.nome}', descricao: '${req.body.descricao}', conclusao: '${req.body.conclusao}', tipo: '${req.body.tipo}', dataInicio: date('${req.body.dataInicio}'), dataFim: date('${req.body.dataFim}')}) CREATE (u)-[:CRIA {org: ${req.body.organizacao}}]->(c) RETURN c`)
                            .then((result) => {
                                inserted.contrato = {id: result.records[0]._fields[0].properties.id.low, nome: result.records[0]._fields[0].properties.nome, descricao: result.records[0]._fields[0].properties.descricao, conclusao: result.records[0]._fields[0].properties.conclusao, dataInicio: result.records[0]._fields[0].properties.dataInicio, dataFim: result.records[0]._fields[0].properties.dataFim, tipo: result.records[0]._fields[0].properties.tipo};
                            })
                            .catch((error) => {
                                console.log(error);
                                res.status(400).send("Algo correu mal com a query.");
                                trans.rollback();
                            });
            
                        if(req.body.assinaturas){
                            for(assinatura of req.body.assinaturas){
                                await trans.run(`MATCH (c:Contrato) WHERE c.id = ${id} MATCH (a:${assinatura.tipo}) WHERE a.id = ${assinatura.id} CREATE (a)-[:ASSINA]->(c) RETURN a`)
                                    .then((result) => {
                                        inserted.assinaturas.push({id: result.records[0]._fields[0].properties.id.low, tipo: `${result.records[0]._fields[0].labels[0]}`});
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        res.status(400).send("Algo correu mal com a query.");
                                        trans.rollback();
                                    });
                            }    
                        }
            
                        if(req.body.proposicoes){
                            for(proposicao of req.body.proposicoes){
                                await trans.run(`MATCH (c:Contrato) WHERE c.id = ${id} MATCH (p:${proposicao.tipo}) WHERE p.id = ${proposicao.id} CREATE (p)-[:PROPOE]->(c) RETURN p`)
                                    .then((result) => {
                                        inserted.proposicoes.push({id: result.records[0]._fields[0].properties.id.low, tipo: `${result.records[0]._fields[0].labels[0]}`});
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        res.status(400).send("Algo correu mal com a query.");
                                        trans.rollback();
                                    });
                            }    
                        }
                        
                        if(req.body.concursos){
                            for(concurso of req.body.concursos){
                                await trans.run(`MATCH (c:Contrato) WHERE c.id = ${id} MATCH (co:Concurso) WHERE co.id = ${concurso.id} CREATE (co)-[:GERA]->(c) RETURN co`)
                                    .then((result) => {
                                        inserted.concursos.push({id: result.records[0]._fields[0].properties.id.low});
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        res.status(400).send("Algo correu mal com a query.");
                                        trans.rollback();
                                    });
                            }    
                        }    
                    }
                })
                .catch((error) => {
                    console.log(error);
                    res.status(400).send("Algo correu mal com a query.");
                    trans.rollback();
                })
        } else {
            await trans.run(`MATCH (u:${user.tipo}) WHERE u.id = ${user.id} CREATE (c:Contrato {id: ${id}, nome: '${req.body.nome}', descricao: '${req.body.descricao}', conclusao: '${req.body.conclusao}', tipo: '${req.body.tipo}', dataInicio: date('${req.body.dataInicio}'), dataFim: date('${req.body.dataFim}')}) CREATE (u)-[:CRIA]->(c) RETURN c`)
                .then((result) => {
                    inserted.contrato = {id: result.records[0]._fields[0].properties.id.low, nome: result.records[0]._fields[0].properties.nome, descricao: result.records[0]._fields[0].properties.descricao, conclusao: result.records[0]._fields[0].properties.conclusao, dataInicio: result.records[0]._fields[0].properties.dataInicio, dataFim: result.records[0]._fields[0].properties.dataFim, tipo: result.records[0]._fields[0].properties.tipo};
                })
                .catch((error) => {
                    console.log(error);
                    res.status(400).send("Algo correu mal com a query.");
                    trans.rollback();
                });

            if(req.body.assinaturas){
                for(assinatura of req.body.assinaturas){
                    await trans.run(`MATCH (c:Contrato) WHERE c.id = ${id} MATCH (a:${assinatura.tipo}) WHERE a.id = ${assinatura.id} CREATE (a)-[:ASSINA]->(c) RETURN a`)
                        .then((result) => {
                            inserted.assinaturas.push({id: result.records[0]._fields[0].properties.id.low, tipo: `${result.records[0]._fields[0].labels[0]}`});
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        });
                }    
            }

            if(req.body.proposicoes){
                for(proposicao of req.body.proposicoes){
                    await trans.run(`MATCH (c:Contrato) WHERE c.id = ${id} MATCH (p:${proposicao.tipo}) WHERE p.id = ${proposicao.id} CREATE (p)-[:PROPOE]->(c) RETURN p`)
                        .then((result) => {
                            inserted.proposicoes.push({id: result.records[0]._fields[0].properties.id.low, tipo: `${result.records[0]._fields[0].labels[0]}`});
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        });
                }    
            }
            
            if(req.body.concursos){
                for(concurso of req.body.concursos){
                    await trans.run(`MATCH (c:Contrato) WHERE c.id = ${id} MATCH (co:Concurso) WHERE co.id = ${concurso.id} CREATE (co)-[:GERA]->(c) RETURN co`)
                        .then((result) => {
                            inserted.concursos.push({id: result.records[0]._fields[0].properties.id.low});
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        });
                }    
            }    
        }
    }

    if(user && (user.tipo == 'Empresario' ||  user.tipo == 'Politico')){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, inserted).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(201).send(inserted);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

app.put("/api/contratos/:id", (req, res) => {

    var session = driver.session();

    const result = validateAlterarContrato(req.body);
    if(result.error) return res.status(400).send(result.error);

    user = validateToken(req, res);

    var updatedNode = {contrato: {}, assinaturas: [], concursos: [], proposicoes: []};

    var statement = `MATCH (p:${user.tipo})-[:CRIA]->(c:Contrato) WHERE c.id = ${req.params.id} AND p.id = ${user.id} `;
    
    if(req.body.nome){
        statement = statement + `SET c.nome = '${req.body.nome}' `;
    }
    if(req.body.descricao){
        if(statement.includes("SET")){
            statement = statement + `, c.descricao = '${req.body.descricao}' `;
        } else {
            statement = statement + `SET c.descricao = '${req.body.descricao}' `;
        }
    }
    if(req.body.conclusao){
        if(statement.includes("SET")){
            statement = statement + `, c.conclusao = '${req.body.conclusao}' `;
        } else {
            statement = statement + `SET c.conclusao = '${req.body.conclusao}' `;
        }
    }
    if(req.body.tipo){
        if(statement.includes("SET")){
            statement = statement + `, c.tipo = '${req.body.tipo}' `;
        } else {
            statement = statement + `SET c.tipo = '${req.body.tipo}' `;
        }
    }
    if(req.body.dataInicio){
        if(statement.includes("SET")){
            statement = statement + `, c.dataInicio = date('${req.body.dataInicio}') `;
        } else {
            statement = statement + `SET c.dataInicio = date('${req.body.dataInicio}') `;
        }
    }
    if(req.body.dataFim){
        if(statement.includes("SET")){
            statement = statement + `, c.dataFim = date('${req.body.dataFim}') `;
        } else {
            statement = statement + `SET c.dataFim = date('${req.body.dataFim}') `;
        }
    }

    statement = statement + "RETURN c";

    var trans;

    var pesquisa = async (user) => {

        trans = session.beginTransaction();

        await trans.run(statement)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Contrato não encontrado.");
                    trans.rollback();
                } else {
                    updatedNode.contrato = {id: req.params.id, nome: `${result.records[0]._fields[0].properties.nome}`, descricao: `${result.records[0]._fields[0].properties.descricao}`, conclusao: `${result.records[0]._fields[0].properties.conclusao}`, tipo: `${result.records[0]._fields[0].properties.tipo}`, dataInicio: `${result.records[0]._fields[0].properties.dataInicio}`, dataFim: `${result.records[0]._fields[0].properties.dataFim}`};
                    await trans.run(`MATCH (n)-[a:ASSINA]->(c:Contrato) WHERE c.id = ${req.params.id} DELETE a`)
                        .then(async (result) => {
                            if(req.body.assinaturas){
                                for(assinatura of req.body.assinaturas){
                                    await trans.run(`MATCH (c:Contrato) WHERE c.id = ${req.params.id} MATCH (a:${assinatura.tipo}) WHERE a.id = ${assinatura.id} CREATE (a)-[:ASSINA]->(c) RETURN a`)
                                        .then((result) => {
                                            updatedNode.assinaturas.push({id: result.records[0]._fields[0].properties.id.low, tipo: result.records[0]._fields[0].labels[0]});
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                            res.status(400).send("Algo correu mal com a query.");
                                            trans.rollback();
                                        });
                                }
                            }         
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        });

                    await trans.run(`MATCH (n)-[p:PROPOE]->(c:Contrato) WHERE c.id = ${req.params.id} DELETE p`)
                        .then(async (result) => {
                            if(req.body.proposicoes){
                                for(proposicao of req.body.proposicoes){
                                    await trans.run(`MATCH (c:Contrato) WHERE c.id = ${req.params.id} MATCH (p:${proposicao.tipo}) WHERE p.id = ${proposicao.id} CREATE (p)-[:PROPOE]->(c) RETURN p`)
                                        .then((result) => {
                                            updatedNode.proposicoes.push({id: result.records[0]._fields[0].properties.id.low, tipo: result.records[0]._fields[0].labels[0]});
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                            res.status(400).send("Algo correu mal com a query.");
                                            trans.rollback();
                                        });
                                }
                            }         
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        });

                    await trans.run(`MATCH (n:Concurso)-[g:GERA]->(c:Contrato) WHERE c.id = ${req.params.id} DELETE g`)
                        .then(async (result) => {
                            if(req.body.concursos){
                                for(concurso of req.body.concursos){
                                    await trans.run(`MATCH (c:Contrato) WHERE c.id = ${req.params.id} MATCH (co:Concurso) WHERE co.id = ${concurso.id} CREATE (co)-[:GERA]->(c) RETURN co`)
                                        .then((result) => {
                                             updatedNode.concursos.push({id: result.records[0]._fields[0].properties.id.low});
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                            res.status(400).send("Algo correu mal com a query.");
                                            trans.rollback();
                                        });
                                }
                            }           
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        }); 
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
                trans.rollback();
            });
    }

    if(user && (user.tipo == 'Empresario' ||  user.tipo == 'Politico')){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, updatedNode).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(200).send(updatedNode);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

app.delete("/api/contratos/:id", (req, res) => {

    var session = driver.session();

    const result = validateApagarContrato(req.body);
    if(result.error) return res.status(400).send(result.error);

    var user = validateToken(req, res);

    var deletedNode = {};

    var trans;

    var statement;

    if(user.tipo == "Administrador"){
        statement = `MATCH (c:Contrato) WHERE c.id = ${req.params.id}`;
    } else {
        statement = `MATCH (p:${user.tipo})-[:CRIA]->(c:Contrato) WHERE c.id = ${req.params.id} AND p.id = ${user.id}`;
    }

    statement += " WITH c, c.dataInicio AS dataInicio, c.dataFim AS dataFim, c.tipo AS tipo, c.nome AS nome, c.descricao AS descricao, c.conclusao AS conclusao DETACH DELETE c RETURN nome, descricao, conclusao, tipo, dataInicio, dataFim";
    
    var pesquisa = async (user) => {

        trans = session.beginTransaction();

        await trans.run(statement)
            .then((result) => {
                if(result.records.length == 0){
                    res.status(404).send("Contrato não encontrado.");
                    trans.rollback();
                } else {
                    deletedNode.id = req.params.id;
                    deletedNode.nome = `${result.records[0]._fields[0]}`;
                    deletedNode.descricao = `${result.records[0]._fields[1]}`;
                    deletedNode.conclusao = `${result.records[0]._fields[2]}`;
                    deletedNode.tipo = `${result.records[0]._fields[3]}`;
                    deletedNode.dataInicio = `${result.records[0]._fields[4]}`;
                    deletedNode.dataFim = `${result.records[0]._fields[5]}`;
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
                trans.rollback();
            });
    }

    if(user && (user.tipo == 'Empresario' ||  user.tipo == 'Politico' || user.tipo == 'Administrador')){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, deletedNode).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(200).send(deletedNode);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

/**
 * @swagger
 * 
 * /api/politicos:
 *      get:
 *          description: Obtém informação de todos os políticos que satisfazem os parametros de procura.
 *          parameters:
 *              - in: query
 *                name: search
 *              - in: query
 *                name: circuloEleitoral
 *              - in: query
 *                name: partido
 * 
 *          responses:
 *              '200':
 *                  description: Políticos obtidos com sucesso. Devolve informação de todos esses políticos.
 *                              
 *              '400':
 *                  description: Erro com o pedido. 
 */ 
app.get("/api/politicos", (req, res) => {

    var session = driver.session();

    var matchedNodes = [];

    var statement = "MATCH (p:Politico)-[:PERTENCE_A*0..1]->(o:Organizacao) WHERE o.tipo='Partido'";

    if(req.query.partido){
        statement = `MATCH (p:Politico)-[:PERTENCE_A]->(o:Organizacao) WHERE o.id = ${req.query.partido} AND o.tipo='Partido'`
    }

    if(req.query.search){
        if(statement.includes("WHERE")){
            statement = statement + ` AND p.nome =~ '(?i).*${req.query.search}.*'`;
        } else {
            statement = statement + ` WHERE p.nome =~ '(?i).*${req.query.search}.*'`;
        }
    }

    if(req.query.circuloEleitoral){
        if(statement.includes("WHERE")){
            statement = statement + ` AND p.circuloEleitoral = '${req.query.circuloEleitoral}'`;
        } else {
            statement = statement + ` WHERE p.circuloEleitoral = '${req.query.circuloEleitoral}'`;
        }
    }

    statement = statement + " RETURN p, o";
    
    session.run(statement)
        .then((result) => {
            result.records.forEach((record) => {
                matchedNodes.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome, username: record._fields[0].properties.username, circuloEleitoral: record._fields[0].properties.circuloEleitoral, habilitacoes: record._fields[0].properties.habilitacoes, nCC: record._fields[0].properties.nCC.low, partido: record._fields[1].properties.nome, ativo: record._fields[0].properties.ativo});
            });
            res.send(matchedNodes);
        })
        .catch((error) => {
            console.log(error);
            res.status(400).send("Algo correu mal com a query.");
        });
});

/**
 * @swagger
 * 
 * /api/politicos/{id}:
 *      get:
 *          description: Obtém informação de um político.
 *          parameters:
 *              - in: path
 *                name: id
 * 
 *          responses:
 *              '200':
 *                  description: Político obtido com sucesso. Devolve informação do político.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '404':
 *                  description: Político não encontrado.
 */ 
app.get("/api/politicos/:id", (req, res) => {

    var session = driver.session();

    var matchedNode = {politico: {}, partido: {}, organizacoes: [], registos: {acerca: []}, contratos: {assinados: [], propostos: []}, concursos: {organizados: [], participados: [], vencidos: []}, eventos: {organizados: [], participados: []}};

    var pesquisa = async () => {
        await session.run(`MATCH (p:Politico) WHERE p.id = ${req.params.id} RETURN p`)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Politico não encontrado.");
                } else {
                    matchedNode.politico = {id: result.records[0]._fields[0].properties.id.low, nome: result.records[0]._fields[0].properties.nome, username: result.records[0]._fields[0].properties.username, circuloEleitoral: result.records[0]._fields[0].properties.circuloEleitoral, habilitacoes: result.records[0]._fields[0].properties.habilitacoes, nCC: result.records[0]._fields[0].properties.nCC.low};
                    await session.run(`MATCH (p:Politico)-[:PERTENCE_A]->(o:Organizacao) WHERE p.id = ${req.params.id} AND o.tipo = 'Partido' RETURN o`)
                        .then((result) => {
                            if(result.records.length > 0){
                                matchedNode.partido = {id: result.records[0]._fields[0].properties.id.low, nome: result.records[0]._fields[0].properties.nome};
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (p:Politico)<-[:ACERCA_DE]-(r:Registo) WHERE p.id = ${req.params.id} RETURN r`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.registos.acerca.push({id: record._fields[0].properties.id.low, titulo: record._fields[0].properties.titulo});
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (p:Politico)-[:PERTENCE_A]->(o:Organizacao) WHERE p.id = ${req.params.id} RETURN o`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.organizacoes.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (p:Politico)-[:ORGANIZA]->(c:Concurso) WHERE p.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.organizados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (p:Politico)-[:PARTICIPA_EM]->(c:Concurso) WHERE p.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.participados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (p:Politico)-[:VENCE]->(c:Concurso) WHERE p.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.vencidos.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (p:Politico)-[:PROPOE]->(c:Contrato) WHERE p.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.contratos.propostos.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (p:Politico)-[:ASSINA]->(c:Contrato) WHERE p.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.contratos.assinados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                    
                    await session.run(`MATCH (p:Politico)-[:ORGANIZA]->(e:Evento) WHERE p.id = ${req.params.id} RETURN e`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.eventos.organizados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                    
                    await session.run(`MATCH (p:Politico)-[:PARTICIPA_EM]->(e:Evento) WHERE p.id = ${req.params.id} RETURN e`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.eventos.participados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })        
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })
    }

    pesquisa().then(() => {
        if(!res.writableEnded){
            res.status(200).send(matchedNode);
        }
    })
});

/**
 * @swagger
 * 
 * /api/empresarios:
 *      get:
 *          description: Obtém informação de todos os empresários que satisfazem os parametros de procura.
 *          parameters:
 *              - in: query
 *                name: search
 *              - in: query
 *                name: organizacao
 * 
 *          responses:
 *              '200':
 *                  description: Empresários obtidos com sucesso. Devolve informação de todos esses empresários.
 *                              
 *              '400':
 *                  description: Erro com o pedido. 
 */ 
app.get("/api/empresarios", (req, res) => {

    var session = driver.session();

    var matchedNodes = [];

    var statement = "MATCH (e:Empresario)";

    if(req.query.organizacao){
        statement = `MATCH (e:Empresario)-[:PERTENCE_A]->(o:Organizacao) WHERE o.id = ${req.query.organizacao}`
    }

    if(req.query.search){
        if(statement.includes("WHERE")){
            statement = statement + ` AND e.nome =~ '(?i).*${req.query.search}.*'`;
        } else {
            statement = statement + ` WHERE e.nome =~ '(?i).*${req.query.search}.*'`;
        }
    }

    statement = statement + " RETURN e";

    session.run(statement)
        .then((result) => {
            result.records.forEach((record) => {
                matchedNodes.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome, username: record._fields[0].properties.username, nCC: record._fields[0].properties.nCC.low, ativo: record._fields[0].properties.ativo});
            });
            res.status(200).send(matchedNodes);
        })
        .catch((error) => {
            console.log(error);
            res.status(400).send("Algo correu mal com a query.");
        });
});

/**
 * @swagger
 * 
 * /api/empresarios/{id}:
 *      get:
 *          description: Obtém informação de um empresário.
 *          parameters:
 *              - in: path
 *                name: id
 * 
 *          responses:
 *              '200':
 *                  description: Empresário obtido com sucesso. Devolve informação do empresário.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '404':
 *                  description: Empresário não encontrado.
 */ 
app.get("/api/empresarios/:id", (req, res) => {

    var session = driver.session();

    var matchedNode = {empresario: {}, organizacoes: [], registos: {acerca: []}, contratos: {assinados: [], propostos: []}, concursos: {organizados: [], participados: [], vencidos: []}, eventos: {organizados: [], participados: []}};

    var pesquisa = async () => {
        await session.run(`MATCH (e:Empresario) WHERE e.id = ${req.params.id} RETURN e`)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Empresario não encontrado.");
                } else {
                    matchedNode.empresario = {id: result.records[0]._fields[0].properties.id.low, nome: result.records[0]._fields[0].properties.nome, username: result.records[0]._fields[0].properties.username, nCC: result.records[0]._fields[0].properties.nCC.low};
                    await session.run(`MATCH (e:Empresario)-[:PERTENCE_A]->(o:Organizacao) WHERE e.id = ${req.params.id} RETURN o`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.organizacoes.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (e:Empresario)<-[:ACERCA_DE]-(r:Registo) WHERE e.id = ${req.params.id} RETURN r`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.registos.acerca.push({id: record._fields[0].properties.id.low, titulo: record._fields[0].properties.titulo });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (e:Empresario)-[:ORGANIZA]->(c:Concurso) WHERE e.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.organizados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (e:Empresario)-[:PARTICIPA_EM]->(c:Concurso) WHERE e.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.participados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (e:Empresario)-[:VENCE]->(c:Concurso) WHERE e.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.vencidos.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (e:Empresario)-[:PROPOE]->(c:Contrato) WHERE e.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.contratos.propostos.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (e:Empresario)-[:ASSINA]->(c:Contrato) WHERE e.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.contratos.assinados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                    
                    await session.run(`MATCH (e:Empresario)-[:ORGANIZA]->(e2:Evento) WHERE e.id = ${req.params.id} RETURN e2`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.eventos.organizados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                    
                    await session.run(`MATCH (e:Empresario)-[:PARTICIPA_EM]->(e2:Evento) WHERE e.id = ${req.params.id} RETURN e2`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.eventos.participados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })        
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })
    }

    pesquisa().then(() => {
        if(!res.writableEnded){
            res.status(200).send(matchedNode);
        }
    })
});

/**
 * @swagger
 * 
 * /api/organizacoes:
 *      get:
 *          description: Obtém informação de todos as organizações que satisfazem os parametros de procura.
 *          parameters:
 *              - in: query
 *                name: search
 *              - in: query
 *                name: tipo
 * 
 *          responses:
 *              '200':
 *                  description: Organizações obtidas com sucesso. Devolve informação de todos essas organizações.
 *                              
 *              '400':
 *                  description: Erro com o pedido. 
 * 
 *      post:
 *          description: Registar uma nova organização. Possível quando logged in como como um administrador.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 * 
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              tipo:
 *                                  type: string
 *                                  required: true
 *                                  example: "Empresa"
 *                              nome:
 *                                  type: string
 *                                  required: true
 *                                  example: "organização teste"
 *                              descricao:
 *                                  type: string
 *                                  required: true
 *                                  example: "descrição da organização teste"
 *                              dataCriacao:
 *                                  type: integer
 *                                  required: true
 *                                  example: "2020-12-03"
 *                              nipc:
 *                                  type: integer
 *                                  required: true
 *                                  example: 723847124
 * 
 *          responses:
 *              '200':
 *                  description: Organização registada com sucesso. Devolve a informação da organização criada.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para alterar as informações desta organização ou o token de acesso está fora de validade.
 *              
 */ 
app.get("/api/organizacoes", (req, res) => {

    var session = driver.session();

    var matchedNodes = [];

    var statement = "MATCH (o:Organizacao)";

    if(req.query.search){
        statement = statement + ` WHERE o.nome =~ '(?i).*${req.query.search}.*'`;
    }

    if(req.query.tipo){
        if(statement.includes("WHERE")){
            statement = statement + ` AND o.tipo = '${req.query.tipo}'`;
        } else {
            statement = statement + ` WHERE o.tipo = '${req.query.tipo}'`;
        }
    }

    statement = statement + " RETURN o";

    session.run(statement)
        .then((result) => {
            result.records.forEach((record) => {
                matchedNodes.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome, descricao: record._fields[0].properties.descricao, dataCriacao: record._fields[0].properties.dataCriacao, tipo: record._fields[0].properties.tipo, nipc: record._fields[0].properties.nipc.low});
            });
            res.status(200).send(matchedNodes);
        })
        .catch((error) => {
            console.log(error);
            res.status(400).send("Algo correu mal com a query.");
        });
});

/**
 * @swagger
 * 
 * /api/organizacoes/{id}:
 *      get:
 *          description: Obtém informação de uma organização.
 *          parameters:
 *              - in: path
 *                name: id
 * 
 *          responses:
 *              '200':
 *                  description: Organização obtida com sucesso. Devolve informação da organização.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '404':
 *                  description: Organização não encontrada.
 * 
 *      put:
 *          description: Atualizar informação de uma organização. Possível quando logged in como como um administrador.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: path
 *                name: id
 * 
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              tipo:
 *                                  type: string
 *                                  example: "Empresa"
 *                              nome:
 *                                  type: string
 *                                  example: "organização teste 2"
 *                              descricao:
 *                                  type: string
 *                                  example: "descrição da organização teste 2"
 *                              dataCriacao:
 *                                  type: integer
 *                                  example: "2020-12-03"
 *                              nipc:
 *                                  type: integer
 *                                  example: 823451246
 * 
 *          responses:
 *              '200':
 *                  description: Informações da organização alteradas com sucesso. Devolve novas informações da organização.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para alterar as informações desta organização ou o token de acesso está fora de validade.
 *              
 *              '404':
 *                  description: Organização não encontrada.
 */ 
app.get("/api/organizacoes/:id", (req, res) => {

    var session = driver.session();

    var matchedNode = {organizacao: {}, associados: [], registos: {acerca: []}, contratos: {assinados: [], propostos: []}, concursos: {organizados: [], participados: [], vencidos: []}, eventos: {organizados: [], participados: []}};

    var pesquisa = async () => {
        await session.run(`MATCH (o:Organizacao) WHERE o.id = ${req.params.id} RETURN o`)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Organização não encontrada.");
                } else {
                    matchedNode.organizacao = {id: result.records[0]._fields[0].properties.id.low, nome: result.records[0]._fields[0].properties.nome, descricao: result.records[0]._fields[0].properties.descricao, dataCriacao: result.records[0]._fields[0].properties.dataCriacao, tipo: result.records[0]._fields[0].properties.tipo, nipc: result.records[0]._fields[0].properties.nipc.low};
                    await session.run(`MATCH (p)-[:PERTENCE_A]->(o:Organizacao) WHERE o.id = ${req.params.id} RETURN p`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.associados.push({id: record._fields[0].properties.id.low, tipo: record._fields[0].labels[0], nome: record._fields[0].properties.nome});
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (o:Organizacao)<-[:ACERCA_DE]-(r:Registo) WHERE o.id = ${req.params.id} RETURN r`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.registos.acerca.push({id: record._fields[0].properties.id.low, titulo: record._fields[0].properties.titulo });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (o:Organizacao)-[:ORGANIZA]->(c:Concurso) WHERE o.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.organizados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (o:Organizacao)-[:PARTICIPA_EM]->(c:Concurso) WHERE o.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.participados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (o:Organizacao)-[:VENCE]->(c:Concurso) WHERE o.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.vencidos.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (o:Organizacao)-[:PROPOE]->(c:Contrato) WHERE o.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.contratos.propostos.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (o:Organizacao)-[:ASSINA]->(c:Contrato) WHERE o.id = ${req.params.id} RETURN c`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.contratos.assinados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                    
                    await session.run(`MATCH (o:Organizacao)-[:ORGANIZA]->(e:Evento) WHERE o.id = ${req.params.id} RETURN e`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.eventos.organizados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                    
                    await session.run(`MATCH (o:Organizacao)-[:PARTICIPA_EM]->(e:Evento) WHERE o.id = ${req.params.id} RETURN e`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.eventos.participados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })        
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })
    }

    pesquisa().then(() => {
        if(!res.writableEnded){
            res.status(200).send(matchedNode);
        }
    })
});

app.post("/api/organizacoes", (req, res) => {

    var session = driver.session();

    const result = validateOrganizacao(req.body);
    if(result.error) return res.status(400).send(result.error);

    user = validateToken(req, res);

    var insertedNode = {};

    var trans;

    var pesquisa = async () => {

        await session.run(`MATCH (o:Organizacao) WHERE o.nome = '${req.body.nome}' OR o.nipc = ${req.body.nipc} RETURN o`)
            .then(async (result) => {
                if(result.records.length > 0){
                    res.status(400).send("Já existe uma organização com o nome ou nipc introduzido.");
                } else {
                    const idGrande = uuidGen.uuid();
                    const id = idGrande % 10000000;

                    trans = session.beginTransaction();

                    await trans.run(`CREATE (o:Organizacao {id: ${id}, nome: '${req.body.nome}', tipo: '${req.body.tipo}', descricao: '${req.body.descricao}', dataCriacao: date('${req.body.dataCriacao}'), nipc: ${req.body.nipc}})`)
                        .then((result) => {
                            insertedNode.id = id;
                            insertedNode.nome = `${req.body.nome}`;
                            insertedNode.type = `${req.body.tipo}`;
                            insertedNode.descricao = `${req.body.descricao}`;
                            insertedNode.dataCriacao = `${req.body.dataCriacao}`;
                            insertedNode.nipc = req.body.nipc;
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        });
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            });    
    }

    if(user && user.tipo == 'Administrador'){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, insertedNode).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(201).send(insertedNode);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

app.put("/api/organizacoes/:id", (req, res) => {

    var session = driver.session();

    const result = validateAlterarOrganizacao(req.body);
    if(result.error) return res.status(400).send(result.error);

    var user = validateToken(req, res);

    var updatedNode = {};

    var statement = `MATCH (o:Organizacao) WHERE o.id = ${req.params.id} `;

    if(req.body.nome){
        statement = statement + `SET o.nome = '${req.body.nome}' `;
    }
    if(req.body.descricao){
        if(statement.includes("SET")){
            statement = statement + `, o.descricao = '${req.body.descricao}' `;
        } else {
            statement = statement + `SET o.descricao = '${req.body.descricao}' `;
        }
    }
    if(req.body.conclusao){
        if(statement.includes("SET")){
            statement = statement + `, o.conclusao = '${req.body.conclusao}' `;
        } else {
            statement = statement + `SET o.conclusao = '${req.body.conclusao}' `;
        }
    }
    if(req.body.tipo){
        if(statement.includes("SET")){
            statement = statement + `, o.tipo = '${req.body.tipo}' `;
        } else {
            statement = statement + `SET o.tipo = '${req.body.tipo}' `;
        }
    }
    if(req.body.dataCriacao){
        if(statement.includes("SET")){
            statement = statement + `, o.dataCriacao = date('${req.body.dataCriacao}') `;
        } else {
            statement = statement + `SET o.dataCriacao = date('${req.body.dataCriacao}') `;
        }
    }
    if(req.body.nipc){
        if(statement.includes("SET")){
            statement = statement + `, o.nipc = ${req.body.nipc} `;
        } else {
            statement = statement + `SET o.nipc = ${req.body.nipc} `;
        }
    }

    statement = statement + "RETURN o";

    if(req.body.username || req.body.nipc){
        var statement2;
        var errorMessage;

        if(req.body.username && !req.body.nipc){
            statement2 = `MATCH (n) WHERE n.username = '${req.body.username}' RETURN n`;
            errorMessage = "Já existe um utilizador com esse username.";
        } else if(!req.body.username && req.body.nipc){
            statement2 = `MATCH (n) WHERE n.nCC = ${req.body.nipc} RETURN n`;
            errorMessage = "Já existe um utilizador com esse nipc.";
        } else if(req.body.username && req.body.nipc){
            statement2 = `MATCH (n) WHERE n.username = '${req.body.username}' OR n.nCC = ${req.body.nipc} RETURN n`;
            errorMessage = "Já existe um utilizador com esse username ou nipc.";
        }
    }

    var trans;

    var pesquisa = async () => {

        trans = session.beginTransaction();

        await trans.run(`MATCH (o:Organizacao) WHERE o.id = ${req.params.id} RETURN o`)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Organização não encontrada.");
                    trans.rollback();
                } else {
                    if(req.body.nome || req.body.nipc){
                        await trans.run(statement2)
                            .then(async (result) => {
                                if(result.records.length > 0){
                                    res.status(401).send(errorMessage);
                                    trans.rollback();
                                } else {
                                    await trans.run(statement)
                                        .then((result) => {
                                            updatedNode.id = req.params.id;
                                            updatedNode.nome = `${result.records[0]._fields[0].properties.nome}`;
                                            updatedNode.descricao = `${result.records[0]._fields[0].properties.descricao}`;
                                            updatedNode.tipo = `${result.records[0]._fields[0].properties.tipo}`;
                                            updatedNode.dataCriacao = `${result.records[0]._fields[0].properties.dataCriacao}`;
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                            res.status(400).send("Algo correu mal com a query.");
                                            trans.rollback();
                                        }); 
                                    }
                            })  
                            .catch((error) => {
                                console.log(error);
                                res.status(400).send("Algo correu mal com a query.");
                                trans.rollback();
                            });
                    } else {
                        await trans.run(statement)
                            .then((result) => {
                                updatedNode.id = req.params.id;
                                updatedNode.nome = `${result.records[0]._fields[0].properties.nome}`;
                                updatedNode.descricao = `${result.records[0]._fields[0].properties.descricao}`;
                                updatedNode.tipo = `${result.records[0]._fields[0].properties.tipo}`;
                                updatedNode.dataCriacao = `${result.records[0]._fields[0].properties.dataCriacao}`; 
                            })
                            .catch((error) => {
                                console.log(error);
                                res.status(400).send("Algo correu mal com a query.");
                                trans.rollback();
                            });     
                    }
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
                trans.rollback();
            }) 
    }

    if(user && user.tipo == 'Administrador'){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, updatedNode).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(200).send(updatedNode);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

/**
 * @swagger
 * 
 * /api/organizacoes/{id}/associar:
 *      post:
 *          description: Associar o utilizador logged in a uma organização ou desassociá-lo caso já esteja associado. Possível quando logged in como político, empresário oi cidadão creditado.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: path
 *                name: id
 * 
 *          responses:
 *              '201':
 *                  description: Utilizador e organização associados/desassociados com sucesso.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para se associar/desassociar a uma empresa ou o token de acesso está fora de validade.
 *              
 *              '404':
 *                  description: Organização não encontrada.
 */ 
app.post("/api/organizacoes/:id/associar", (req, res) => {

    var session = driver.session();

    var changedNode = {};

    var trans;

    var user = validateToken(req, res);

    var pesquisa = async (user) => {

        trans = session.beginTransaction();

        await trans.run(`MATCH (o:Organizacao) WHERE o.id = ${req.params.id} RETURN o`)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Organização não encontrada.");
                    trans.rollback();
                } else {
                    await trans.run(`MATCH (u:${user.tipo})-[p:PERTENCE_A]->(o:Organizacao) WHERE o.id = ${req.params.id} AND u.id = ${user.id} WITH p.dataInicio as data, p DELETE p RETURN data`)
                        .then(async (result) => {
                            if(result.records.length == 0){
                                await trans.run(`MATCH (u:${user.tipo}) WHERE u.id = ${user.id} MATCH (o:Organizacao) WHERE o.id = ${req.params.id} CREATE (u)-[:PERTENCE_A {dataInicio: date()}]->(o)`)
                                    .then((result) => {
                                        changedNode.tipoUser = user.tipo;
                                        changedNode.user = user.id;
                                        changedNode.organizacao = req.params.id;
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        res.status(400).send("Algo correu mal com a query.");
                                        trans.rollback();
                                    })
                            } else {
                                changedNode.tipoUser = user.tipo;
                                changedNode.user = user.id;
                                changedNode.organizacao = req.params.id;
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        })            
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
                trans.rollback();
            })
    }

    if(user && (user.tipo == 'Empresario' || user.tipo == 'Politico' || user.tipo == 'CidadaoCreditado')){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, changedNode).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(201).send(changedNode);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

/**
 * @swagger
 * 
 * /api/cidadaosRegistados:
 *      get:
 *          description: Obtém informação de todos os cidadãos regitados. Possível quando logged in como administrador, empresario, político ou cidadão creditado.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: query
 *                name: search
 * 
 *          responses:
 *              '200':
 *                  description: Cidadãos registados obtidos com sucesso. Devolve informação de todos esses cidadãos registados.
 *                              
 *              '400':
 *                  description: Erro com o pedido. 
 * 
 *              '401':
 *                  description: Access token em falta.
 *          
 *              '403':
 *                  description: Este utilizador não tem permissões para aceder às informações de todos os cidadãos registados ou o token de acesso é inválido.        
 */ 
app.get("/api/cidadaosRegistados", (req, res) => {
    
    var session = driver.session();

    user = validateToken(req, res);

    var matchedNodes = [];

    var statement = "MATCH (c:CidadaoRegistado)";

    if(req.query.search){
        statement = statement + ` WHERE c.nome =~ '(?i).*${req.query.search}.*'`;
    }

    statement = statement + " RETURN c";

    var pesquisa = async () => {

        await session.run(statement)
            .then((result) => {
                result.records.forEach((record) => {
                    matchedNodes.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome, username: record._fields[0].properties.username, nCC: record._fields[0].properties.nCC.low, ativo: record._fields[0].properties.ativo});
                });
                res.send(matchedNodes);
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            });
    }

    if(user && user.tipo != 'CidadaoRegistado'){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, matchedNodes).then(() => {
            pesquisa().then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(201).send(matchedNodes);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

/**
 * @swagger
 * 
 * /api/CidadaosRegistados/{id}:
 *      get:
 *          description: Obtém informação de um cidadão registado.
 *          parameters:
 *              - in: path
 *                name: id
 * 
 *          responses:
 *              '200':
 *                  description: Cidadão registado obtido com sucesso. Devolve informação do cidadão registado.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '404':
 *                  description: Cidadão registado não encontrado.
 */ 
app.get("/api/CidadaosRegistados/:id", (req, res) => {

    var session = driver.session();

    var matchedNode = {cidadaoRegistado: {}, registos: {acerca: []}, contratos: {assinados: []}, concursos: {participados: [], vencidos: []}, eventos: {participados: []}};

    var pesquisa = async () => {
        await session.run(`MATCH (c:CidadaoRegistado) WHERE c.id = ${req.params.id} RETURN c`)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Cidadão registado não encontrado.");
                } else {
                    matchedNode.cidadaoRegistado = {id: result.records[0]._fields[0].properties.id.low, nome: result.records[0]._fields[0].properties.nome, username: result.records[0]._fields[0].properties.username, nCC: result.records[0]._fields[0].properties.nCC.low};
                    
                    await session.run(`MATCH (c:CidadaoRegistado)<-[:ACERCA_DE]-(r:Registo) WHERE c.id = ${req.params.id} RETURN r`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.registos.acerca.push({id: record._fields[0].properties.id.low, titulo: record._fields[0].properties.titulo });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (c1:CidadaoRegistado)-[:PARTICIPA_EM]->(c2:Concurso) WHERE c1.id = ${req.params.id} RETURN c2`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.participados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (c1:CidadaoRegistado)-[:VENCE]->(c2:Concurso) WHERE c1.id = ${req.params.id} RETURN c2`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.vencidos.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (c1:CidadaoRegistado)-[:ASSINA]->(c2:Contrato) WHERE c1.id = ${req.params.id} RETURN c2`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.contratos.assinados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                    
                    await session.run(`MATCH (c:CidadaoRegistado)-[:PARTICIPA_EM]->(e:Evento) WHERE c.id = ${req.params.id} RETURN e`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.eventos.participados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })        
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })
    }

    pesquisa().then(() => {
        if(!res.writableEnded){
            res.status(200).send(matchedNode);
        }
    })
});

/**
 * @swagger
 * 
 * /api/cidadaosCreditados:
 *      get:
 *          description: Obtém informação de todos os cidadãos creditados.
 *          parameters:
 *              - in: query
 *                name: search
 * 
 *          responses:
 *              '200':
 *                  description: Cidadãos creditados obtidos com sucesso. Devolve informação de todos esses cidadãos creditados.
 *                              
 *              '400':
 *                  description: Erro com o pedido. 
 * 
 */ 
app.get("/api/cidadaosCreditados", (req, res) => {

    var session = driver.session();

    var matchedNodes = [];

    var statement = "MATCH (c:CidadaoCreditado)";

    if(req.query.search){
        statement = statement + ` WHERE c.nome =~ '(?i).*${req.query.search}.*'`;
    }

    statement = statement + " RETURN c";

    session.run(statement)
        .then((result) => {
            result.records.forEach((record) => {
                matchedNodes.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome, username: record._fields[0].properties.username, nCC: record._fields[0].properties.nCC.low, ativo: record._fields[0].properties.ativo});
            });
            res.status(200).send(matchedNodes);
        })
        .catch((error) => {
            console.log(error);
            res.status(400).send("Algo correu mal com a query.");
        });
});

/**
 * @swagger
 * 
 * /api/CidadaosCreditados/{id}:
 *      get:
 *          description: Obtém informação de um cidadão creditado.
 *          parameters:
 *              - in: path
 *                name: id
 * 
 *          responses:
 *              '200':
 *                  description: Cidadão creditado obtido com sucesso. Devolve informação do cidadão creditado.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '404':
 *                  description: Cidadão creditado não encontrado.
 */ 
app.get("/api/CidadaosCreditados/:id", (req, res) => {

    var session = driver.session();

    var matchedNode = {cidadaoCreditado: {}, registos: {criados: [], acerca: []}, organizacoes: [], contratos: {assinados: []}, concursos: {participados: [], vencidos: []}, eventos: {participados: []}};

    var pesquisa = async () => {
        await session.run(`MATCH (c:CidadaoCreditado) WHERE c.id = ${req.params.id} RETURN c`)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Cidadão creditado não encontrado.");
                } else {
                    matchedNode.cidadaoCreditado = {id: result.records[0]._fields[0].properties.id.low, nome: result.records[0]._fields[0].properties.nome, username: result.records[0]._fields[0].properties.username, nCC: result.records[0]._fields[0].properties.nCC.low};
                    
                    await session.run(`MATCH (c:CidadaoCreditado)-[:CRIA]->(r:Registo) WHERE c.id = ${req.params.id} RETURN r`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.registos.criados.push({id: record._fields[0].properties.id.low, titulo: record._fields[0].properties.titulo });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (c:CidadaoCreditado)<-[:ACERCA_DE]-(r:Registo) WHERE c.id = ${req.params.id} RETURN r`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.registos.acerca.push({id: record._fields[0].properties.id.low, titulo: record._fields[0].properties.titulo });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (c:CidadaoCreditado)-[:PERTENCE_A]->(o:Organizacao) WHERE c.id = ${req.params.id} RETURN o`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.organizacoes.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (c1:CidadaoCreditado)-[:PARTICIPA_EM]->(c2:Concurso) WHERE c1.id = ${req.params.id} RETURN c2`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.participados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (c1:CidadaoCreditado)-[:VENCE]->(c2:Concurso) WHERE c1.id = ${req.params.id} RETURN c2`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.concursos.vencidos.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })

                    await session.run(`MATCH (c1:CidadaoCreditado)-[:ASSINA]->(c2:Contrato) WHERE c1.id = ${req.params.id} RETURN c2`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.contratos.assinados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })
                    
                    await session.run(`MATCH (c:CidadaoCreditado)-[:PARTICIPA_EM]->(e:Evento) WHERE c.id = ${req.params.id} RETURN e`)
                        .then((result) => {
                            result.records.forEach((record) => {
                                matchedNode.eventos.participados.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                        })        
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })
    }

    pesquisa().then(() => {
        if(!res.writableEnded){
            res.status(200).send(matchedNode);
        }
    })
});

/**
 * @swagger
 * 
 * /api/administradores:
 *      get:
 *          description: Obtém informação de todos os administradores. Possível quando logged in como administrador.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: query
 *                name: search
 * 
 *          responses:
 *              '200':
 *                  description: Administradores obtidos com sucesso. Devolve informação de todos esses administradores.
 *                              
 *              '400':
 *                  description: Erro com o pedido. 
 * 
 */ 
app.get("/api/administradores", (req, res) => {

    var session = driver.session();

    var matchedNodes = [];

    var statement = "MATCH (a:Administrador)";

    if(req.query.search){
        statement = statement + ` WHERE a.nome =~ '(?i).*${req.query.search}.*'`;
    }

    statement = statement + " RETURN a";

    user = validateToken(req, res);

    var pesquisa = async () => {
        await session.run(statement)
            .then((result) => {
                result.records.forEach((record) => {
                    matchedNodes.push({id: record._fields[0].properties.id.low, nome: record._fields[0].properties.nome, username: record._fields[0].properties.username, nCC: record._fields[0].properties.nCC.low, ativo: record._fields[0].properties.ativo});
                });
                res.status(200).send(matchedNodes);
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            });    
    }

    if(user && user.tipo == "Administrador"){
        refreshToken({id: user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, matchedNodes).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(201).send(matchedNodes);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

/**
 * @swagger
 * 
 * /api/registos/{id}/comentarios:
 *      post:
 *          description: Cria um novo comentário num registo. Possível quando logged in.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: path
 *                name: id
 * 
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              descricao:
 *                                  type: string
 *                                  required: true
 *                                  example: "comentario teste"
 *          responses:
 *              '201':
 *                  description: Um novo comentário foi criado com sucesso. Devolve a informação do novo comentário.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta.
 *              
 *              '403':
 *                  description: O token de acesso está fora de validade.
 *                      
 */
app.post("/api/registos/:id/comentarios", (req, res) => {

    var session = driver.session();

    const result = validateComentario(req.body);
    if(result.error) return res.status(400).send(result.error);

    user = validateToken(req, res);

    const idGrande = uuidGen.uuid();
    const id = idGrande % 10000000;
    var insertedNode = {};

    var trans;

    var pesquisa = async (user) => {

        trans = session.beginTransaction();
        
        await trans.run(`MATCH (u:${user.tipo}) WHERE u.id = ${user.id} MATCH (r:Registo) WHERE r.id = ${req.params.id} CREATE (u)-[:COMENTA]->(c:Comentario {id: ${id}, descricao: '${req.body.descricao}', data: date()})-[:ESTA_EM]->(r) RETURN c`)
            .then((result) => {
                insertedNode.id = id;
                insertedNode.descricao = `${req.body.descricao}`;
                insertedNode.data = `${result.records[0]._fields[0].properties.data}`;
                insertedNode.registo = req.params.id;
                insertedNode.tipoUser = user.tipo;
                insertedNode.user = user.id;
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
                trans.rollback();
            });    
    }

    if(user){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, insertedNode).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(201).send(insertedNode);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

/**
 * @swagger
 * 
 * /api/registos/{idReg}/comentarios/{id}:
 *      delete:
 *          description: Apaga um comentário de um registo. Possível quando logged in como administrador.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: path
 *                name: idReg
 *              - in: path
 *                name: id
 * 
 *          responses:
 *              '200':
 *                  description: O comentário foi apagado com sucesso. Devolve a informação do comentário.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta.
 *              
 *              '403':
 *                  description: O utilizador não tem permissões para apagar um comentário ou o token de acesso está fora de validade.
 *                    
 *              '404':
 *                  description: Comentário não encontrado.  
 */
app.delete("/api/registos/:idReg/comentarios/:id", (req, res) => {

    var session = driver.session();

    var trans;

    var deletedNode = {};

    user = validateToken(req, res);

    var pesquisa = async () => {

        trans = session.beginTransaction();

        await trans.run(`MATCH (c:Comentario) WHERE c.id = ${req.params.id} WITH c, c.id AS id, c.descricao AS descricao, c.data AS data DETACH DELETE c RETURN id, descricao, data`)
            .then((result) => {
                if(result.records.length == 0){
                    res.status(404).send("Comentario não encontrado.");
                    trans.rollback();
                } else {
                    deletedNode.id = result.records[0]._fields[0].low;
                    deletedNode.descricao = result.records[0]._fields[1];
                    deletedNode.data = result.records[0]._fields[2];
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
                trans.rollback();
            });    
    }

    if(user && user.tipo == 'Administrador'){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, deletedNode).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.status(200).send(deletedNode);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }  
});

/**
 * @swagger
 * 
 * /api/registos/{id}/votar:
 *      post:
 *          description: Efetua um voto num registo. Possível quando logged in como não administrador.
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: header
 *                name: refreshToken
 *              - in: path
 *                name: id
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              valor:
 *                                  type: integer
 *                                  required: true
 *                                  example: -1
 *          responses:
 *              '201':
 *                  description: Um novo voto foi efetuado. Devolve a informação do novo voto.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 * 
 *              '401':
 *                  description: Access token em falta.
 *              
 *              '403':
 *                  description: O token de acesso está fora de validade.
 * 
 *              '404':
 *                  description: Registo não encontrado.
 *                      
 */
app.post("/api/registos/:id/votar", (req, res) => {

    var session = driver.session();

    const result = validateVoto(req.body);
    if(result.error) return res.status(400).send(result.error);

    user = validateToken(req, res);

    var changedNode = {};

    var trans;

    var pesquisa = async (user) => {

        trans = session.beginTransaction();

        await trans.run (`MATCH (r:Registo) WHERE r.id = ${req.params.id} RETURN r`)
            .then(async (result) => {
                if(result.records.length == 0){
                    res.status(404).send("Registo não encontrado.");
                    trans.rollback();
                } else{
                    await trans.run(`MATCH (u:${user.tipo})-[v:VOTA_EM]->(r:Registo) WHERE r.id = ${req.params.id} AND u.id = ${user.id} AND v.valor = ${req.body.valor} SET r.credibilidade = r.credibilidade - ${req.body.valor} WITH v, v.valor AS valor DELETE v RETURN valor`)
                        .then(async (result) => {
                            if(result.records.length == 0){
                                await trans.run(`MATCH (u:${user.tipo})-[v:VOTA_EM]->(r:Registo) WHERE r.id = ${req.params.id} AND u.id = ${user.id} AND v.valor <> ${req.body.valor} SET v.valor = ${req.body.valor}, r.credibilidade = r.credibilidade + (2 * ${req.body.valor}) RETURN v`)
                                    .then(async (result) => {
                                        if(result.records.length == 0){
                                            await trans.run(`MATCH (u:${user.tipo}) WHERE u.id = ${user.id} MATCH (r:Registo) WHERE r.id = ${req.params.id} CREATE (u)-[:VOTA_EM {valor: ${req.body.valor}}]->(r) SET r.credibilidade = r.credibilidade + ${req.body.valor}`)
                                                .then((result) => {
                                                    changedNode.user = user.id;
                                                    changedNode.tipoUser = user.tipo;
                                                    changedNode.registo = req.params.id;
                                                    changedNode.valor = req.body.valor;
                                                })
                                                .catch((error) => {
                                                    console.log(error);
                                                    res.status(400).send("Algo correu mal com a query.");
                                                    trans.rollback();
                                                })
                                        } else {
                                            changedNode.user = user.id;
                                            changedNode.tipoUser = user.tipo;
                                            changedNode.registo = req.params.id;
                                            changedNode.valor = req.body.valor;
                                        }
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        res.status(400).send("Algo correu mal com a query.");
                                        trans.rollback();
                                    });
                            } else {
                                changedNode.user = user.id;
                                changedNode.tipoUser = user.tipo;
                                changedNode.registo = req.params.id;
                                changedNode.valor = req.body.valor;
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("Algo correu mal com a query.");
                            trans.rollback();
                        });
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
                trans.rollback();
            })
        
    }

    if(user && user.tipo != 'Administrador'){
        refreshToken({id:user.id, username: user.username, tipo: user.tipo}, req.headers.refreshtoken, session, changedNode).then(() => {
            pesquisa(user).then(() => {
                if(!res.writableEnded){
                    trans.commit();
                    res.send(changedNode);
                }
            })    
        });
    } else {
        if(!res.writableEnded){
            res.status(403).send("Este utilizador não tem permissões para efetuar a esta operação.");
        }
    }
});

/**
 * @swagger
 * 
 * /api/grafo:
 *      get:
 *          description: Obtém todas as entidades e relações entre as mesmas.
 * 
 *          responses:
 *              '200':
 *                  description: Informação obtida com sucesso. Devolve a informação.
 *                              
 *              '400':
 *                  description: Erro com o pedido.
 */ 
app.get("/api/grafo", (req, res) => {

    var session = driver.session();

    var grafo = {nodes: [], links: []};

    var pesquisa = async () => {
        await session.run("MATCH (p:Politico)-[r*0..1]->(n) RETURN p, r, n")
            .then(result => {
                result.records.forEach(record => {
                    var existeNode = false;
                    grafo.nodes.forEach(node => {
                        if(node.id == record._fields[0].identity.low){
                            existeNode = true;
                        }    
                    });

                    if(!existeNode){
                        grafo.nodes.push({
                            id: record._fields[0].identity.low,
                            tipo: record._fields[0].labels[0],
                            propriedades: {
                                id: record._fields[0].properties.id.low,
                                nome: record._fields[0].properties.nome,
                                nCC: record._fields[0].properties.nCC.low,
                                habilitacoes: record._fields[0].properties.habilitacoes,
                                circuloEleitoral: record._fields[0].properties.circuloEleitoral    
                            }
                        });   
                    }
                    if(record._fields[1] && record._fields[2] && record._fields[2].labels[0] != "Comentario"){
                        record._fields[1].forEach(rel => {
                            if(rel.type != "VOTA_EM"){
                                grafo.links.push({
                                    source: rel.start.low,
                                    target: rel.end.low,
                                    type: rel.type,
                                    propriedades: rel.properties
                                });      
                            } 
                        });  
                    }
                })
            })
            .catch(error => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })

        await session.run("MATCH (e:Empresario)-[r*0..1]->(n) RETURN e, r, n")
            .then(result => {
                result.records.forEach(record => {

                    var existeNode = false;

                    grafo.nodes.forEach(node => {
                        if(node.id == record._fields[0].identity.low){
                            existeNode = true;
                        }    
                    });

                    if(!existeNode){
                        grafo.nodes.push({
                            id: record._fields[0].identity.low,
                            tipo: record._fields[0].labels[0],
                            propriedades: {
                                id: record._fields[0].properties.id.low,
                                nome: record._fields[0].properties.nome,
                                nCC: record._fields[0].properties.nCC.low   
                            }
                        });   
                    }

                    if(record._fields[1] && record._fields[2] && record._fields[2].labels[0] != "Comentario"){
                        record._fields[1].forEach(rel => {
                            if(rel.type != "VOTA_EM"){
                                grafo.links.push({
                                    source: rel.start.low,
                                    target: rel.end.low,
                                    type: rel.type,
                                    propriedades: rel.properties
                                });      
                            }     
                        });  
                    }
                })
            })
            .catch(error => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })

        await session.run("MATCH (c:CidadaoCreditado)-[r*0..1]->(n) RETURN c, r, n")
            .then(result => {
                result.records.forEach(record => {

                    var existeNode = false;

                    grafo.nodes.forEach(node => {
                        if(node.id == record._fields[0].identity.low){
                            existeNode = true;
                        }    
                    });

                    if(!existeNode){
                        grafo.nodes.push({
                            id: record._fields[0].identity.low,
                            tipo: record._fields[0].labels[0],
                            propriedades: {
                                id: record._fields[0].properties.id.low,
                                nome: record._fields[0].properties.nome,
                                nCC: record._fields[0].properties.nCC.low  
                            }
                        });   
                    }

                    if(record._fields[1] && record._fields[2] && record._fields[2].labels[0] != "Comentario"){
                        record._fields[1].forEach(rel => {
                            if(rel.type != "VOTA_EM"){
                                grafo.links.push({
                                    source: rel.start.low,
                                    target: rel.end.low,
                                    type: rel.type,
                                    propriedades: rel.properties
                                });      
                            }    
                        });  
                    }
                })
            })
            .catch(error => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })

        await session.run("MATCH (c:CidadaoRegistado)-[r*0..1]->(n) RETURN c, r, n")
            .then(result => {
                result.records.forEach(record => {
                    
                    var existeNode = false;

                    grafo.nodes.forEach(node => {
                        if(node.id == record._fields[0].identity.low){
                            existeNode = true;
                        }    
                    });

                    if(!existeNode){
                        grafo.nodes.push({
                            id: record._fields[0].identity.low,
                            tipo: record._fields[0].labels[0],
                            propriedades: {
                                id: record._fields[0].properties.id.low,
                                nome: record._fields[0].properties.nome,
                                nCC: record._fields[0].properties.nCC.low  
                            }
                        });   
                    }

                    if(record._fields[1] && record._fields[2] && record._fields[2].labels[0] != "Comentario"){
                        record._fields[1].forEach(rel => {
                            if(rel.type != "VOTA_EM"){
                                grafo.links.push({
                                    source: rel.start.low,
                                    target: rel.end.low,
                                    type: rel.type,
                                    propriedades: rel.properties
                                });      
                            }  
                        });  
                    }
                })
            })
            .catch(error => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })

        await session.run("MATCH (o:Organizacao)-[r*0..1]->(n) RETURN o, r, n")
            .then(result => {
                result.records.forEach(record => {

                    var existeNode = false;

                    grafo.nodes.forEach(node => {
                        if(node.id == record._fields[0].identity.low){
                            existeNode = true;
                        }    
                    });

                    if(!existeNode){
                        grafo.nodes.push({
                            id: record._fields[0].identity.low,
                            tipo: record._fields[0].labels[0],
                            propriedades: {
                                id: record._fields[0].properties.id.low,
                                nome: record._fields[0].properties.nome,
                                tipo: record._fields[0].properties.tipo,
                                descricao: record._fields[0].properties.descricao,
                                dataCriacao: record._fields[0].properties.dataCriacao,
                                nipc: record._fields[0].properties.nipc.low  
                            }
                        });   
                    }

                    if(record._fields[1] && record._fields[2] && record._fields[2].labels[0] != "Comentario"){
                        record._fields[1].forEach(rel => {
                            if(rel.type != "VOTA_EM"){
                                grafo.links.push({
                                    source: rel.start.low,
                                    target: rel.end.low,
                                    type: rel.type,
                                    propriedades: rel.properties
                                });      
                            } 
                        });  
                    }
                })
            })
            .catch(error => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })

        await session.run("MATCH (e:Evento)-[r*0..1]->(n) RETURN e, r, n")
            .then(result => {
                result.records.forEach(record => {

                    var existeNode = false;

                    grafo.nodes.forEach(node => {
                        if(node.id == record._fields[0].identity.low){
                            existeNode = true;
                        }    
                    });

                    if(!existeNode){
                        grafo.nodes.push({
                            id: record._fields[0].identity.low,
                            tipo: record._fields[0].labels[0],
                            propriedades: {
                                id: record._fields[0].properties.id.low,
                                nome: record._fields[0].properties.nome,
                                descricao: record._fields[0].properties.descricao,
                                exclusividade: record._fields[0].properties.exclusividade,
                                dataInicio: record._fields[0].properties.dataInicio,
                                dataFim: record._fields[0].properties.dataFim
                            }
                        });   
                    }

                    if(record._fields[1] && record._fields[2] && record._fields[2].labels[0] != "Comentario"){
                        record._fields[1].forEach(rel => {
                            if(rel.type != "VOTA_EM"){
                                grafo.links.push({
                                    source: rel.start.low,
                                    target: rel.end.low,
                                    type: rel.type,
                                    propriedades: rel.properties
                                });      
                            } 
                        });  
                    }
                })
            })
            .catch(error => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })

        await session.run("MATCH (c:Concurso)-[r*0..1]->(n) RETURN c, r, n")
            .then(result => {
                result.records.forEach(record => {

                    var existeNode = false;

                    grafo.nodes.forEach(node => {
                        if(node.id == record._fields[0].identity.low){
                            existeNode = true;
                        }    
                    });

                    if(!existeNode){
                        grafo.nodes.push({
                            id: record._fields[0].identity.low,
                            tipo: record._fields[0].labels[0],
                            propriedades: {
                                id: record._fields[0].properties.id.low,
                                nome: record._fields[0].properties.nome,
                                descricao: record._fields[0].properties.descricao,
                                tipo: record._fields[0].properties.tipo,
                                dataInicio: record._fields[0].properties.dataInicio,
                                dataFim: record._fields[0].properties.dataFim
                            }
                        });   
                    }

                    if(record._fields[1] && record._fields[2] && record._fields[2].labels[0] != "Comentario"){
                        record._fields[1].forEach(rel => {
                            if(rel.type != "VOTA_EM"){
                                grafo.links.push({
                                    source: rel.start.low,
                                    target: rel.end.low,
                                    type: rel.type,
                                    propriedades: rel.properties
                                });      
                            } 
                        });  
                    }
                })
            })
            .catch(error => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })

        await session.run("MATCH (c:Contrato)-[r*0..1]->(n) RETURN c, r, n")
            .then(result => {
                result.records.forEach(record => {

                    var existeNode = false;

                    grafo.nodes.forEach(node => {
                        if(node.id == record._fields[0].identity.low){
                            existeNode = true;
                        }    
                    });

                    if(!existeNode){
                        grafo.nodes.push({
                            id: record._fields[0].identity.low,
                            tipo: record._fields[0].labels[0],
                            propriedades: {
                                id: record._fields[0].properties.id.low,
                                nome: record._fields[0].properties.nome,
                                descricao: record._fields[0].properties.descricao,
                                conclusao: record._fields[0].properties.conclusao,
                                tipo: record._fields[0].properties.tipo,
                                dataInicio: record._fields[0].properties.dataInicio,
                                dataFim: record._fields[0].properties.dataFim
                            }
                        });   
                    }

                    if(record._fields[1] && record._fields[2] && record._fields[2].labels[0] != "Comentario"){
                        record._fields[1].forEach(rel => {
                            if(rel.type != "VOTA_EM"){
                                grafo.links.push({
                                    source: rel.start.low,
                                    target: rel.end.low,
                                    type: rel.type,
                                    propriedades: rel.properties
                                });      
                            }  
                        });  
                    }
                })
            })
            .catch(error => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })

        await session.run("MATCH (re:Registo)-[r*0..1]->(n) RETURN re, r, n")
            .then(result => {
                result.records.forEach(record => {

                    var existeNode = false;

                    grafo.nodes.forEach(node => {
                        if(node.id == record._fields[0].identity.low){
                            existeNode = true;
                        }    
                    });

                    if(!existeNode){
                        grafo.nodes.push({
                            id: record._fields[0].identity.low,
                            tipo: record._fields[0].labels[0],
                            propriedades: {
                                id: record._fields[0].properties.id.low,
                                titulo: record._fields[0].properties.titulo,
                                descricao: record._fields[0].properties.descricao,
                                credibilidade: record._fields[0].properties.credibilidade.low  
                            }
                        });   
                    }

                    if(record._fields[1] && record._fields[2] && record._fields[2].labels[0] != "Comentario"){
                        record._fields[1].forEach(rel => {
                            if(rel.type != "VOTA_EM"){
                                grafo.links.push({
                                    source: rel.start.low,
                                    target: rel.end.low,
                                    type: rel.type,
                                    propriedades: rel.properties
                                });      
                            } 
                        });  
                    }
                })
            })
            .catch(error => {
                console.log(error);
                res.status(400).send("Algo correu mal com a query.");
            })
    }

    pesquisa().then(() => {
        if(!res.writableEnded){
            res.status(200).send(grafo);
        }
    })
});

//start app
app.listen(3000, () => console.log("Listening on port 3000..."));

//input validation
function validateLogin(login){

    const schema = Joi.object({
        username: Joi.string().min(3).max(20).required(),
        password: Joi.string().min(5).max(50).required()
    })

    return schema.validate(login);
}

function validateRegister(register){

    const schema = Joi.object({
        username: Joi.string().min(3).max(20).required(),
        password: Joi.string().min(5).max(50).required(),
        nome: Joi.string().min(5).max(50).required(),
        nCC: Joi.number().min(1).max(99999999).required()
    })

    return schema.validate(register)
}

function validateRegisterPolitico(register){

    const schema = Joi.object({
        circuloEleitoral: Joi.string().min(3).max(50).required(),
        partido: Joi.number().min(1).max(999999999).required(),
        habilitacoes: Joi.string().valid('Nenhuma', '4º ano', '6º ano', '9º ano', '12º ano', 'Licenciatura', 'Mestrado', 'Doutoramento').required(),
        username: Joi.string().min(3).max(20).required(),
        password: Joi.string().min(5).max(50).required(),
        nome: Joi.string().min(5).max(50).required(),
        nCC: Joi.number().min(1).max(99999999).required()
    })

    return schema.validate(register)
}

function validateAlterarUser(user){

    const schema = Joi.object({
        username: Joi.string().min(3).max(20),
        password: Joi.string().min(5).max(50),
        nome: Joi.string().min(5).max(50),
        nCC: Joi.number().min(1).max(99999999)
    })

    return schema.validate(user)
}

function validateAlterarPolitico(user){

    const schema = Joi.object({
        circuloEleitoral: Joi.string().min(3).max(50),
        username: Joi.string().min(3).max(20),
        password: Joi.string().min(5).max(50),
        nome: Joi.string().min(5).max(50),
        nCC: Joi.number().min(1).max(99999999),
        partido: Joi.number().min(1).max(999999999),
        habilitacoes: Joi.string().valid('Nenhuma', '4º ano', '6º ano', '9º ano', '12º ano', 'Licenciatura', 'Mestrado', 'Doutoramento')
    })

    return schema.validate(user)
}

function validateRegisto(registo){

    const schema = Joi.object({
        titulo: Joi.string().min(5).max(50).required(),
        descricao: Joi.string().min(1).max(1000).required(),
        assuntos: Joi.array().min(1).items(Joi.object({
            id: Joi.number().required(), 
            tipo: Joi.string().valid('Organizacao', 'Evento', 'Contrato', 'Concurso', 'Politico', 'Empresario', 'CidadaoCreditado', 'CidadaoRegistado').required()
        })).required()
    })

    return schema.validate(registo)
}

function validateEvento(evento){

    const schema = Joi.object({
        organizacao: Joi.number().min(1),
        nome: Joi.string().min(5).max(50).required(),
        descricao: Joi.string().min(1).max(1000).required(),
        exclusividade: Joi.string().valid('Publico', 'Privado').required(),
        dataInicio: Joi.date().required(),
        dataFim: Joi.date().min(Joi.ref('dataInicio')).required(),
        convidados: Joi.array().items(Joi.object({
            id: Joi.number().required(), 
            tipo: Joi.string().valid('Organizacao', 'CidadaoRegistado', 'Politico', 'Empresario', 'CidadaoCreditado').required()
        }))
    })

    return schema.validate(evento)
}

function validateAlterarEvento(evento){

    const schema = Joi.object({
        organizacao: Joi.number().min(1),
        nome: Joi.string().min(5).max(50),
        descricao: Joi.string().min(1).max(1000),
        exclusividade: Joi.string().valid('Publico', 'Privado'),
        dataInicio: Joi.date(),
        dataFim: Joi.date().min(Joi.ref('dataInicio')),
        convidados: Joi.array().items(Joi.object({
            id: Joi.number().required(), 
            tipo: Joi.string().valid('Organizacao', 'CidadaoRegistado', 'Politico', 'Empresario', 'CidadaoCreditado').required()
        }))
    })

    return schema.validate(evento)
}

function validateApagarEvento(evento){

    const schema = Joi.object({
        organizacao: Joi.number().min(1)
    })

    return schema.validate(evento)
}

function validateConcurso(concurso){

    const schema = Joi.object({
        organizacao: Joi.number().min(1),
        nome: Joi.string().min(5).max(50).required(),
        descricao: Joi.string().min(1).max(1000).required(),
        tipo: Joi.string().valid('Construcao', 'Outro').required(),
        dataInicio: Joi.date().required(),
        dataFim: Joi.date().min(Joi.ref('dataInicio')).required(),
        participantes: Joi.array().min(1).items(Joi.object({
            id: Joi.number().required(), 
            tipo: Joi.string().valid('Organizacao', 'Politico', 'Empresario', 'CidadaoRegistado').required()
        })),
        vencedores: Joi.array().min(1).items(Joi.object({
            id: Joi.number().required(), 
            tipo: Joi.string().valid('Organizacao', 'Politico', 'Empresario', 'CidadaoRegistado').required()
        }))
    })

    return schema.validate(concurso)
}

function validateAlterarConcurso(concurso){

    const schema = Joi.object({
        organizacao: Joi.number().min(1),
        nome: Joi.string().min(5).max(50),
        descricao: Joi.string().min(1).max(1000),
        tipo: Joi.string().valid('Construcao', 'Outro'),
        dataInicio: Joi.date(),
        dataFim: Joi.date().min(Joi.ref('dataInicio')),
        participantes: Joi.array().min(1).items(Joi.object({
            id: Joi.number().required(), 
            tipo: Joi.string().valid('Organizacao', 'Politico', 'Empresario', 'CidadaoRegistado').required()
        })),
        vencedores: Joi.array().min(1).items(Joi.object({
            id: Joi.number().required(), 
            tipo: Joi.string().valid('Organizacao', 'Politico', 'Empresario', 'CidadaoRegistado').required()
        }))
    })

    return schema.validate(concurso)
}

function validateApagarConcurso(concurso){

    const schema = Joi.object({
        organizacao: Joi.number().min(1)
    })

    return schema.validate(concurso)
}

function validateContrato(contrato){

    const schema = Joi.object({
        organizacao: Joi.number().min(1),
        nome: Joi.string().min(5).max(50).required(),
        descricao: Joi.string().min(1).max(1000).required(),
        conclusao: Joi.string().min(1).max(1000).required(),
        tipo: Joi.string().valid('Construcao', 'Outro').required(),
        dataInicio: Joi.date().required(),
        dataFim: Joi.date().min(Joi.ref('dataInicio')).required(),
        assinaturas: Joi.array().min(2).items(Joi.object({
            id: Joi.number().required(), 
            tipo: Joi.string().valid('Organizacao', 'Politico', 'Empresario', 'CidadaoRegistado').required()
        })),
        proposicoes: Joi.array().min(1).items(Joi.object({
            id: Joi.number().required(), 
            tipo: Joi.string().valid('Organizacao', 'Politico', 'Empresario', 'CidadaoRegistado').required()
        })).required(),
        concursos: Joi.array().items(Joi.object({
            id: Joi.number().required()
        }))
    })

    return schema.validate(contrato)
}

function validateAlterarContrato(contrato){

    const schema = Joi.object({
        organizacao: Joi.number().min(1),
        nome: Joi.string().min(5).max(50),
        descricao: Joi.string().min(1).max(1000),
        conclusao: Joi.string().min(1).max(1000),
        tipo: Joi.string().valid('Construcao', 'Outro'),
        dataInicio: Joi.date(),
        dataFim: Joi.date().min(Joi.ref('dataInicio')),
        assinaturas: Joi.array().min(2).items(Joi.object({
            id: Joi.number().required(), 
            tipo: Joi.string().valid('Organizacao', 'Politico', 'Empresario', 'CidadaoRegistado').required()
        })),
        proposicoes: Joi.array().min(1).items(Joi.object({
            id: Joi.number().required(), 
            tipo: Joi.string().valid('Organizacao', 'Politico', 'Empresario', 'CidadaoRegistado').required()
        })),
        concursos: Joi.array().items(Joi.object({
            id: Joi.number().required()
        }))
    })

    return schema.validate(contrato)
}

function validateApagarContrato(contrato){

    const schema = Joi.object({
        organizacao: Joi.number().min(1)
    })

    return schema.validate(contrato)
}

function validateOrganizacao(organizacao){

    const schema = Joi.object({
        tipo: Joi.string().valid('Partido', 'Empresa', 'Outro').required(),
        dataCriacao: Joi.date().max('now').required(),
        nome: Joi.string().min(5).max(50).required(),
        descricao: Joi.string().min(1).max(1000).required(),
        nipc: Joi.number().min(1).max(999999999).required()
    })

    return schema.validate(organizacao)
}

function validateAlterarOrganizacao(organizacao){

    const schema = Joi.object({
        tipo: Joi.string().valid('Partido', 'Empresa', 'Outro'),
        dataCriacao: Joi.date().max('now'),
        nome: Joi.string().min(5).max(50),
        descricao: Joi.string().min(1).max(1000),
        nipc: Joi.number().min(1).max(999999999)
    })

    return schema.validate(organizacao)
}

function validateComentario(comentario){

    const schema = Joi.object({
        descricao: Joi.string().min(1).max(1000).required()
    })

    return schema.validate(comentario)
}

function validateVoto(voto){

    const schema = Joi.object({
        valor: Joi.number().valid(-1, 1).required()
    })

    return schema.validate(voto)
}

function generateTokens(userInfo, res){

    var session = driver.session();

    var accessToken = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
    var refreshToken = jwt.sign(userInfo, process.env.REFRESH_TOKEN_SECRET);

    var trans = session.beginTransaction();

    trans.run(`CREATE (r:RefreshToken {token: '${refreshToken}'})`)
        .then((result) => {
            trans.commit();
        })
        .catch((error) => {
            trans.rollback();
            console.log(error);
            return res.status(400).send("Algo correu mal com a query.");
        });

    return {accessToken: accessToken, refreshToken: refreshToken};
}

function validateToken(req, res){

    var user;

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null){
        res.status(401).send("Efetue login para poder aceder a esta funcionalidade");
        return;
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, u) => {
        
        if(error){
            console.log(error);
            res.status(403).send("A sua sessão expirou. Faça login novamente.");
            return;
        } else {
            user = u;
        }
    });

    return user;
}

async function refreshToken(userInfo, refreshToken, session, node){

    await session.run(`MATCH (r:RefreshToken) WHERE r.token = '${refreshToken}' RETURN r`)
        .then(async (result) => {
            if(result.records.length > 0){
                jwt.verify(result.records[0]._fields[0].properties.token, process.env.REFRESH_TOKEN_SECRET, (error, u) => {
                    if(!error && u.id == userInfo.id && u.tipo == userInfo.tipo){
                        node.token = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10m'});
                    }
                });
            }
        })
        .catch((error) => {
            console.log(error);
        })
}

function deleteToken(refreshToken, res){

    var session = driver.session();

    var trans = session.beginTransaction();

    trans.run(`MATCH (r:RefreshToken) WHERE r.token = '${refreshToken}' WITH r, r AS token DELETE r RETURN token`)
        .then(async (result) => {
            if(result.records.length > 0){
                res.status(200).send("Logged out.");
            } else {
                res.status(401).send("Refresh token inválido.");
            }
        })
}