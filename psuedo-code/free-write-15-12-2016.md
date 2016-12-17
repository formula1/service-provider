
Purpose
- To alleviate the bridge between local development and production microservices

How?
- Each service lets the program know...
  - What services it requires
  - What level of publicity this service is available
    - External - available to only to the internet
    - Internal - available to only other services
    - Self - available only to services that are defined within the same file
  - What type of service it is
  - Some configuration that the service should also do
  - A file which references

What is Automated
- The creation of the networks, permissions and visibiltiy
  - with consideration for multiple ips being used by individual services and shared ip
- The creation of the individual services
- The usable handle to each of the services


What is needed
- Architecture Configuration Validation
  - TIPS
    - to avoid circular dependencies, use a "dispatcher"
  - Input: Folder
    - For each folder in a folder
      - We check if that folder has a service.json
      - We then validate the service.json
        - the instance type can be created with the configuration provided
        - that dependencies are not circular
        - that each dependency has a valid visibility
        - own configuration has a valid visibility for dependents
        - ensure each of its dependencies are available
  - 
