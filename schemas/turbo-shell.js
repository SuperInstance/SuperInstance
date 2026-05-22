"use strict";
/**
 * Turbo Shell Schema
 * Turbo manifest, shell types, and capability definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Capability = exports.ShellType = void 0;
var ShellType;
(function (ShellType) {
    ShellType["BASH"] = "bash";
    ShellType["ZSH"] = "zsh";
    ShellType["FISH"] = "fish";
    ShellType["POWERSHELL"] = "powershell";
    ShellType["CMD"] = "cmd";
    ShellType["PYTHON"] = "python";
    ShellType["NODE"] = "node";
    ShellType["RUST"] = "rust";
    ShellType["GO"] = "go";
    ShellType["DOCKER"] = "docker";
    ShellType["SSH"] = "ssh";
    ShellType["CUSTOM"] = "custom";
})(ShellType || (exports.ShellType = ShellType = {}));
var Capability;
(function (Capability) {
    // Execution capabilities
    Capability["EXECUTE_COMMAND"] = "execute_command";
    Capability["READ_FILE"] = "read_file";
    Capability["WRITE_FILE"] = "write_file";
    Capability["LIST_DIRECTORY"] = "list_directory";
    Capability["CREATE_DIRECTORY"] = "create_directory";
    Capability["DELETE_FILE"] = "delete_file";
    Capability["MOVE_FILE"] = "move_file";
    Capability["COPY_FILE"] = "copy_file";
    // Network capabilities
    Capability["HTTP_GET"] = "http_get";
    Capability["HTTP_POST"] = "http_post";
    Capability["HTTP_PUT"] = "http_put";
    Capability["HTTP_DELETE"] = "http_delete";
    Capability["CONNECT_TCP"] = "connect_tcp";
    Capability["LISTEN_TCP"] = "listen_tcp";
    // Process capabilities
    Capability["SPAWN_PROCESS"] = "spawn_process";
    Capability["KILL_PROCESS"] = "kill_process";
    Capability["GET_PROCESS_INFO"] = "get_process_info";
    Capability["LIST_PROCESSES"] = "list_processes";
    // System capabilities
    Capability["GET_SYSTEM_INFO"] = "get_system_info";
    Capability["GET_ENVIRONMENT"] = "get_environment";
    Capability["SET_ENVIRONMENT"] = "set_environment";
    Capability["READ_ENV_FILE"] = "read_env_file";
    // Docker capabilities
    Capability["DOCKER_RUN"] = "docker_run";
    Capability["DOCKER_BUILD"] = "docker_build";
    Capability["DOCKER_PULL"] = "docker_pull";
    Capability["DOCKER_PS"] = "docker_ps";
    Capability["DOCKER_LOGS"] = "docker_logs";
    // Git capabilities
    Capability["GIT_CLONE"] = "git_clone";
    Capability["GIT_PUSH"] = "git_push";
    Capability["GIT_PULL"] = "git_pull";
    Capability["GIT_COMMIT"] = "git_commit";
    Capability["GIT_STATUS"] = "git_status";
    Capability["GIT_LOG"] = "git_log";
    // Package management
    Capability["NPM_INSTALL"] = "npm_install";
    Capability["NPM_PUBLISH"] = "npm_publish";
    Capability["PIP_INSTALL"] = "pip_install";
    Capability["CARGO_PUBLISH"] = "cargo_publish";
    // Agent capabilities
    Capability["SPAWN_AGENT"] = "spawn_agent";
    Capability["SEND_MESSAGE"] = "send_message";
    Capability["BROADCAST_MESSAGE"] = "broadcast_message";
    // Storage capabilities
    Capability["READ_DATABASE"] = "read_database";
    Capability["WRITE_DATABASE"] = "write_database";
    Capability["CACHE_SET"] = "cache_set";
    Capability["CACHE_GET"] = "cache_get";
    // Admin capabilities
    Capability["ADMIN"] = "admin";
    Capability["CONFIGURE"] = "configure";
    Capability["VIEW_LOGS"] = "view_logs";
})(Capability || (exports.Capability = Capability = {}));
